const elements = {
    selectFileInput: document.getElementById('select-file'),
    choosedListEl: document.getElementById('choose-files'),
    uploadSubmitEl: document.getElementById('upload-submit-btn'),
    uploadContainerEl: document.getElementById('upload-container'),
    progressBarEl: document.getElementById('progress-bar'),
    fileListsEL: document.getElementById('file-lists'),
    currentDirNameEL: document.getElementById('current-dir-name'),
    freshFileListEL: document.getElementById('fresh-file-list'),
}

const uniqueId = {
    index: 1,
    get: () => {
        return ++uniqueId.index
    },
}

class ObservereData {
    constructor(data) {
        this.cbs = []
        this.__data__ = data
        this.__proxy_data__ = this.__hook__(data)
    }

    __hook__(data) {
        const self = this
        return new Proxy(data, {
            get: function (target, key, receiver) {
                return Reflect.get(target, key, receiver)
            },
            set: function (target, key, value, receiver) {
                setTimeout(() => {
                    self.cbs.forEach(cb => {
                        cb(self.__data__)
                    })
                }, 0)
                return Reflect.set(target, key, value, receiver)
            },
        })
    }

    get data() {
        return this.__proxy_data__
    }

    set data(value) {
        return (this.__proxy_data__ = this.__hook__(value))
    }

    watch(cb) {
        this.cbs.push(cb)
    }
}

// 选择文件的 store Observer
const selectFileObserver = new ObservereData([])
// 绑定视图  【已选列表】
selectFileObserver.watch(() => {
    const str = selectFileObserver.data
        .map(file => {
            const { name, size } = file
            return `<div class="file-item">
                    <span class="name">
                        ${name}
                        <span class="size">
                            ${size}
                        </span>
                    </span>
                    <span class="cancel">
                        取消
                    </span>
                </div>`
        })
        .join('')

    elements.choosedListEl.innerHTML = str
})
// 绑定视图 【提交按钮显示隐藏】
selectFileObserver.watch(() => {
    elements.uploadContainerEl.style.display = selectFileObserver.data.length === 0 ? 'none' : 'block'
})

// 进度条的 store Observer
const progressBarObserver = new ObservereData({ progress: 0 })
// 绑定进度条视图
progressBarObserver.watch(() => {
    const progress = progressBarObserver.data.progress
    if (progress === 0 || progress === 100) {
        elements.progressBarEl.style.display = 'none'
    } else {
        elements.progressBarEl.style.display = 'block'
    }
    elements.progressBarEl.children[0].style.width = progress + '%'
})

/** 文件列表 store observer */
const fileListObserver = new ObservereData({
    current: '',
    parent: '',
    files: [],
    lastPath: '',
})

// 绑定文件列表视图  文件列表改变自动渲染
fileListObserver.watch(() => {
    elements.currentDirNameEL.innerText = fileListObserver.data.current
    let str = ''

    if (fileListObserver.data.lastPath) {
        elements.freshFileListEL.style.display = 'block'
    }

    if (fileListObserver.data.parent) {
        str += `<li>
            <span class="icon">⤴️</span>
            <span class="name">
                <a href="javascript:void(0)" data-path="${fileListObserver.data.parent}">
                    ../
                </a>
            </span>
            <span class="size"></span>
        </li>`
    }
    fileListObserver.data.files.forEach(file => {
        if (file.isDir) {
            str += `<li>
            <span class="icon">📂</span>
            <span class="name">
                <a href="javascript:void(0)" data-path="${file.relativePath}">
                    ${file.fileName}
                </a>
            </span>
            <span class="size">
            </span>
        </li>`
        } else {
            str += `<li>
            <span class="icon">📃</span>
            <span class="name">
                <a href="/static/${file.relativePath}" download="${file.fileName}">
                    ${file.fileName}
                </a>
            </span>
            <span class="size">
                ${(file.size / 1023).toFixed(2) + 'KB'}
            </span>
        </li>`
        }
    })
    elements.fileListsEL.innerHTML = str
})

// 监听取消操作
elements.choosedListEl.addEventListener('click', e => {
    const target = e.target
    if (!target.classList.contains('cancel')) {
        return
    }
    const parentChildrens = Array.from(target.parentElement.parentElement.children)
    const index = parentChildrens.indexOf(target)
    selectFileObserver.data.splice(index, 1)
    selectFileObserver.data = selectFileObserver.data
})

// 监听用户选择文件的变动
elements.selectFileInput.addEventListener('change', e => {
    const files = Array.from(e.target.files || 0)
    files.forEach(file => {
        if (selectFileObserver.data.indexOf(file) > -1) {
            return
        }
        selectFileObserver.data.push(file)
    })
})

// 监听上传按钮操作
elements.uploadSubmitEl.addEventListener('click', () => {
    const form = new FormData()
    const map = new WeakMap()
    const fileInfos = selectFileObserver.data.map(file => {
        const id = uniqueId.get()
        map.set(file, id)
        return {
            name: file.name,
            id,
            size: file.size,
        }
    })
    form.append('fileInfos', JSON.stringify(fileInfos))
    selectFileObserver.data.forEach(file => {
        const id = map.get(file)
        form.append(id, file)
    })

    const xhr = new XMLHttpRequest()

    xhr.open('POST', '/api/upload')

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) {
            return
        }
        let success = false
        let resText
        if (xhr.status >= 200 && xhr.status < 300) {
            // 上传成功
            resText = JSON.parse(xhr.responseText)
            if (resText.status === 0) {
                selectFileObserver.data.splice(0)
                success = true
            } else {
                progressBarObserver.data.progress = 0
                success = false
            }
        }
        progressBarObserver.data.progress = 0
        if (success) {
            renderFileListCompose(fileListObserver.data.lastPath)
            alert('上传成功')
        } else {
            alert(('上传失败: ' + resText && resText.error) || '')
        }
    }

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            progressBarObserver.data.progress = (e.loaded / e.total) * 100
        }
    }

    xhr.send(form)
})

/** 更新文件列表 */
function renderFileListCompose(relativePath) {
    // 初始化
    // fileListObserver.data.current = ''
    // fileListObserver.data.parent = ''
    // fileListObserver.data.files = []
    fetch('/api/file-tree/' + relativePath)
        .then(res => res.json())
        .then(data => {
            if (data.status !== 0) {
                throw new Error(data.status + data.error)
            }
            return data.data
        })
        .then(data => {
            fileListObserver.data.current = data.current
            fileListObserver.data.parent = data.parent
            fileListObserver.data.files = data.files
            fileListObserver.data.lastPath = relativePath
        })
        .catch(err => {
            console.error(err)
            alert('list file fail' + err.message)
        })
}

// 监听点击文件夹
elements.fileListsEL.addEventListener('click', e => {
    if (e.target.dataset.path) {
        renderFileListCompose(e.target.dataset.path)
    }
})

// 监听刷新文件列表
elements.freshFileListEL.addEventListener('click', e => {
    renderFileListCompose(fileListObserver.data.lastPath)
})

// 默认渲染 root
renderFileListCompose('.')

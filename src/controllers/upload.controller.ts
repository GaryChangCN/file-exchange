import Router from 'koa-router'
import path from 'path'
import fs from 'fs-extra'
import formidable from 'formidable'
import config from '../config'
import CommonResponse from '../responses/common.response'
import * as cliProgress from 'cli-progress'

const uploadController: Router.IMiddleware = async (ctx, next) => {


    console.log('接受到有文件上传')
    const contentLength = ctx.request.headers['content-length']
    const bar = new cliProgress.SingleBar({
        format: '总进度 [{bar}] {percentage}% | {value}/{total}'
    },  cliProgress.Presets.shades_classic)

    bar.start(contentLength, 0)

    let len = 0
    ctx.request.req.on('data', chunk => {
        len += chunk.length
        bar.update(len)
    })
    ctx.request.req.on('end', () => {
        bar.stop()
    })

    const form = formidable({
        multiples: true,
        maxFieldsSize: 2 * 1024 * 1024 * 1024,
        maxTotalFileSize: 10 * 1024 * 1024 * 1024,
        maxFileSize: 2 * 1024 * 1024 * 1024,
    })

    const result = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
        form.parse(ctx.req, (err, fields, files) => {
            if (err) {
                reject(err)
            } else {
                resolve({
                    fields,
                    files,
                })
            }
        })
    })

    const fileInfos = JSON.parse(result.fields.fileInfos as string)
    for (const info of fileInfos) {
        const { id, name, size } = info
        const file = result.files[id] as formidable.File

        const tmpFilePath = file.filepath
        const newPath = path.resolve(config.fileDir, name)
        await fs.move(tmpFilePath, newPath)
        info.newPath = newPath
        fs.remove(tmpFilePath).catch(() => null)
    }

    ctx.req['fileInfos'] = fileInfos

    ctx.body = new CommonResponse().setData('ok')

    console.log('所有文件上传结束, 上传详情：')
    ctx.req['fileInfos'].forEach(item => {
        console.log(`大小: ${item.size}, 路径: ${(item.newPath)}`)
    })
}

export default uploadController

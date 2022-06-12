import Router from 'koa-router'
import config from '../config'
import fs from 'fs-extra'
import { CommonError } from '../error/common.error'
import ErrorCode from '../error/error-code'
import path from 'path'
import { FileList } from '../typings'
import CommonResponse from '../responses/common.response'

const fileListController: Router.IMiddleware = async (ctx, next) => {
    try {
        const wantPath = path.join(ctx.params[0] || './')
        const wantAbsolutePath = path.resolve(config.fileDir, wantPath)

        // 判断是不是会访问到 workDir 的父级
        if (wantAbsolutePath !== config.fileDir && config.fileDir.startsWith(wantAbsolutePath)) {
            throw new CommonError(ErrorCode.NO_PERMISSION)
        }

        const stats = await fs.stat(wantAbsolutePath)

        if (!stats.isDirectory()) {
            throw new CommonError(ErrorCode.ONLY_SUPPORT_FILE_DIR, wantAbsolutePath + ' is not dir')
        }

        const list = await fs.readdir(wantAbsolutePath)

        const fileList: FileList = {
            current: wantPath, 
            parent: wantAbsolutePath === config.fileDir ? null : path.join(wantPath, '../'),
            files: [],
        }

        for (const name of list) {
            const stat = await fs.stat(path.join(wantAbsolutePath, name))
            fileList.files.push({
                relativePath: path.join(wantPath, name),
                isDir: stat.isDirectory(),
                fileName: name,
                size: stat.size,
                mtime: stat.mtime,
            })
        }

        // 排序
        fileList.files.sort((a, b) => {
            if (a.isDir && !b.isDir) {
                return -1
            }
            return a.fileName.localeCompare(b.fileName)
        })

        ctx.body = new CommonResponse().setData(fileList)
    } catch (error) {
        throw new CommonError(ErrorCode.NORMAL, error.message)
    }
}

export default fileListController

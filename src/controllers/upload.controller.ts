import Router from 'koa-router';
import path from 'path'
import fs from 'fs-extra'
import formidable from 'formidable'
import config from '../config';
import CommonResponse from '../responses/common.response';


const uploadController: Router.IMiddleware = async (ctx, next) => {
    const form = formidable({
        multiples: true,
        maxFieldsSize: 2 * 1024 * 1024 * 1024,
        maxTotalFileSize: 10 * 1024 * 1024 * 1024,
        maxFileSize: 2 * 1024 * 1024 * 1024
    })

    const result = await new Promise<{fields: formidable.Fields;files: formidable.Files}>((resolve, reject) => {
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
        const {id, name, size} = info
        const file = result.files[id] as formidable.File
    
        const tmpFilePath = file.filepath
        const newPath = path.resolve(config.fileDir, name)
        await fs.move(tmpFilePath, newPath)
        info.newPath = newPath
        fs.remove(tmpFilePath).catch(() => null)
    }

    ctx.req['fileInfos'] = fileInfos

    ctx.body = new CommonResponse().setData('ok')
}

export default uploadController

import Router from 'koa-router'
import * as cliProgress from 'cli-progress'


const uploadTipsController: Router.IMiddleware = async (ctx, next) => {
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
    await next()
    console.log('所有文件上传结束, 上传详情：')
    ctx.req['fileInfos'].forEach(item => {
        console.log(`大小: ${item.size}, 路径: ${(item.newPath)}`)
    })
}

export default uploadTipsController

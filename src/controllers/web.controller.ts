import Router from 'koa-router';
import serve from 'koa-static'
import path from 'path'
import fs from 'fs'

const htmlPath = path.resolve(__dirname, '../html/index.html')

const webController: Router.IMiddleware = (ctx, next) => {
    const stream = fs.createReadStream(htmlPath)
    ctx.set('content-type', 'text/html;charset=utf-8')
    ctx.body = stream
}

export default webController

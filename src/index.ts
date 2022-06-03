import Koa from 'koa'
import Router from 'koa-router'
import type { AddressInfo } from 'net'
import webController from './controllers/web.controller'
import uploadController from './controllers/upload.controller'
import config from './config'
import { Optional } from './typings'
import errorMiddleware from './middlewares/error.middleware'
import type http from 'http'
import uploadTipsController from './controllers/upload-tips.controller'

function main(opt?: Optional<typeof config>, listenCB?: (server: http.Server) => void) {
    Object.assign(config, opt || {})
    const app = new Koa()
    const router = new Router()

    // 网页端
    router.get('/', webController)
    // 上传文件
    router.post('/api/upload', errorMiddleware, uploadTipsController, uploadController)

    // 路由中间件
    app.use(router.routes()).use(router.allowedMethods())

    const server = app.listen(config.workPort, '0.0.0.0', () => {
        listenCB?.(server)
    })

    return server
}

export default main

main({
    workPort: 3001,
    fileDir: process.cwd()
}, server => {
    const port = (server.address() as AddressInfo).port
    console.log('port', port)
})

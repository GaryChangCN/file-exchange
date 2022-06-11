import Koa from 'koa'
import Router from 'koa-router'
import Mount from 'koa-mount'
import type { AddressInfo } from 'net'
import uploadController from './controllers/upload.controller'
import config from './config'
import { Optional } from './typings'
import errorMiddleware from './middlewares/error.middleware'
import type http from 'http'
import fileListController from './controllers/file-list.controller'
import serve from 'koa-static'
import path from 'path'

function main(opt?: Optional<typeof config>, listenCB?: (server: http.Server) => void) {
    Object.assign(config, opt || {})
    const app = new Koa()
    const router = new Router()

    // 网页端
    app.use(Mount('/', serve(path.resolve(__dirname, '../html'))))
    // static 中间件，提供静态资源供下载
    app.use(Mount('/static', serve(config.fileDir)))

    // 路由中间件 /api/*
    app.use(Mount('/api', errorMiddleware))
    app.use(Mount('/api', router.routes()))
    app.use(Mount('/api', router.allowedMethods()))

    // 路由表
    // 上传文件
    router.post('/upload', uploadController)
    router.get('/file-tree/(.*)', fileListController)

    const server = app.listen(config.workPort, '0.0.0.0', () => {
        listenCB?.(server)
    })

    return server
}

export default main

main(
    {
        workPort: 3001,
        fileDir: process.cwd(),
    },
    server => {
        const port = (server.address() as AddressInfo).port
        console.log('port', port)
    },
)

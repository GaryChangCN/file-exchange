import Koa from 'koa'
import { CommonError } from '../error/common.error'
import ErrorResponse from '../responses/error.response'


const errorMiddleware: Koa.Middleware = async (ctx, next) => {
    try {
        await next()
    } catch (error) {
        if (error instanceof CommonError) {
            const code = error.code
            ctx.body = new ErrorResponse().setError(code, error.message)
            return
        }
        ctx.body = new ErrorResponse().setError(1, error.message)
    }
}

export default errorMiddleware

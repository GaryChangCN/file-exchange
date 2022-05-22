import Koa from 'koa'
import ErrorResponse from '../responses/error.response'


const errorMiddleware: Koa.Middleware = async (ctx, next) => {
    try {
        await next()
    } catch (error) {
        console.error(error)
        ctx.body = new ErrorResponse().setError(1, error.message)
    }
}

export default errorMiddleware

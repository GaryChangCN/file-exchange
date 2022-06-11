import ErrorCode from './error-code'
const codes = require('./error-code').default


export class CommonError extends Error {
    code: ErrorCode
    constructor(code: ErrorCode, message?: string) {
        super()

        this.code = code
        let msg = `[${codes[code]}]`
        if (message) {
            msg += ` ${message}`
        }
        this.message = msg
    }
}

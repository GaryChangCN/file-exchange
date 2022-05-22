import BaseResponse from './base.responses'

export default class ErrorResponse<T = void> extends BaseResponse {
    constructor() {
        super()
        this.status = 1
    }
    setError(errorCode: number, errorMessage = '') {
        this.status = errorCode
        this.error = errorMessage
        return this
    }
}

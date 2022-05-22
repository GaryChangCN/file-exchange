import BaseResponse from './base.responses'

export default class CommonResponse<T = any> extends BaseResponse {
    constructor() {
        super()
        this.status = 0
    }
    setData(data: T) {
        this.data = data
        return this
    }
}

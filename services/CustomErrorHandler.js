class CustomErrorHandler extends Error {
    constructor(status,msg){
        super();
        this.status = status,
        this.message = msg
        Error.captureStackTrace(this, this.constructor);
    }
    static alreadyExist (msg) {
        return new CustomErrorHandler(409,msg)

    }
    static wrongCredencial (msg = 'Wrong Email and Password') {
        return new CustomErrorHandler(401,msg)

    }
    static unAuthorized (msg = 'UnAuthorized') {
        return new CustomErrorHandler(401,msg)

    }
    static notFound (msg = 'not found') {
        return new CustomErrorHandler(404,msg)

    }
    static serverError (msg = 'Internal Server Error') {
        return new CustomErrorHandler(500,msg)

    }
}
export default CustomErrorHandler
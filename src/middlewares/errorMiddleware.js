const logger = require('../utils/logger');
const { errorMessage, errorMessages } = require('../utils/respon');
const ClientError = require('../errors/clientError');

class ErrorMiddleware {

    #isInstanceofClientError(error) {
        return error instanceof ClientError;
    }

    #clientErrorHandler(res, error) {
        if (error.messages.length > 1) {
            errorMessages(res, error.messages, error.name, error.code);
        } else {
            errorMessage(res, error.message, error.name, error.code);
        }
    }

    #serverErrorHandler(res,error) {
        logger.error(error);
        errorMessage(res, error.message, 'Server Error', 500);
    }

    static errorHandler(error, req, res, next) {
        const instance = new ErrorMiddleware();
        if (instance.#isInstanceofClientError(error)) {
            return instance.#clientErrorHandler(res, error);
        }
        return instance.#serverErrorHandler(res, error);
    }

}

module.exports = ErrorMiddleware
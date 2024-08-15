class ResponseUtil {
    static success(res, message, statusCode = 200, data = null, ) {
        const response = {
            status: 'success',
            message: message,
        };

        if (data !== null) {
            response.data = data;
        }

        res.status(statusCode).json(response);
    }

    static errorMessage(res, message, name, statusCode = 500) {
        const response = {
            status: 'error',
            name: name,
            message: message
        };
        res.status(statusCode).json(response);
    }

    static errorMessages(res, messages, name, statusCode = 400) {
        const response = {
            status: 'error',
            name: name,
            messages: messages
        };
        res.status(statusCode).json(response);
    }
}

module.exports = ResponseUtil;

const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const ClientError = require('../errors/clientError');
const { Console } = require('winston/lib/winston/transports');

class AuthMiddleware {

    static auth(req, res, next) {

        try {
            if (!req.headers.authorization) {
                throw new ClientError(401, "Token not provided");
            }

            const [bearerToken, token] = req.headers.authorization.split(" ");

            if (bearerToken !== "Bearer") {
                throw new ClientError(401, "Invalid Bearer token");
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_KEY);

                if (decoded.type !== process.env.JWT_ACCESS ||
                    decoded.aud !== process.env.JWT_AUDIENCE ||
                    decoded.iss !== process.env.JWT_ISSUER) {
                    throw new ClientError(401, "Invalid token type");
                }

                req._id = decoded._id;
                req.email = decoded.sub;
                
                next();

            } catch (error) {
                throw new ClientError(401, error.message);
            }

        } catch (error) {

            if (error.name == "ClientError") {
                return res.status(401).json({
                    status: "error", name: error.name, message: error.message, links: [
                        {
                            rel: "self",
                            href: req.originalUrl
                        },
                        {
                            rel: "refresh-token",
                            href: "/api/v1/auth/refresh-token"
                        }
                    ]
                });
            }
            return res.status(500).json({ status: "error", message: error.message });
        }


    }

    static refreshToken() {
        return [
            body("refreshToken").notEmpty().withMessage("Refresh token is required"),
            this.validationHandler
        ]
    }

    static validationHandler(req, res, next) {
        const errors = validationResult(req);

        try {
            if (!errors.isEmpty()) {
                const errorsMessage = errors.array().map(error => error.msg);
                throw new ClientError(400, errorsMessage);
            }
            next();
        } catch (error) {
            if (error.name === "ClientError") {
                return res.status(400).json({
                    status: "error",
                    name: error.name,
                    messages: error.messages,
                    links: [
                        {
                            rel: "self",
                            href: req.originalUrl
                        },
                    ]
                });
            }
            return res.status(500).json({ status: "error", message: error.message });
        }


    }

}




module.exports = AuthMiddleware
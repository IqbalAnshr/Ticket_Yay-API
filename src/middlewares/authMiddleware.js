const { verify } = require("../utils/token");
const { body, validationResult } = require("express-validator");
const ClientError = require("../errors/clientError");

class AuthMiddleware {

    extractToken(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new ClientError(401, "Token not provided");
        }

        const [bearerToken, token] = authHeader.split(" ");
        if (bearerToken !== "Bearer") {
            throw new ClientError(401, "Invalid Bearer token");
        }

        return token;
    }

    verifyToken(token, secretKey, { type, audience, issuer }) {
        try {
            const decoded = verify(token, secretKey);

            if (decoded.type !== type ||
                decoded.aud !== audience ||
                decoded.iss !== issuer) {
                throw new ClientError(401, "Invalid token type");
            }

            return decoded;
        } catch (error) {
            throw new ClientError(401, error.message);
        }
    }

    static auth(req, res, next) {
        const instance = new AuthMiddleware();
        try {
            const token = instance.extractToken(req);
            const decoded = instance.verifyToken(token, process.env.JWT_KEY, {
                type: process.env.JWT_ACCESS,
                audience: process.env.JWT_AUDIENCE,
                issuer: process.env.JWT_ISSUER
            });

            req._id = decoded._id;
            req.email = decoded.sub;

            next();
        } catch (error) {
            next(error);
        }
    }

    static optionalAuth(req, res, next) {
        const instance = new AuthMiddleware();
        try {
            if (!req.headers.authorization && req.params.username) {
                throw new ClientError(401, "Unauthorized");
            }
            const token = req.headers.authorization.split(" ")[1];
            if (!token) return next();
            
            const decoded = instance.verifyToken(token, process.env.JWT_KEY, {
                type: process.env.JWT_ACCESS,
                audience: process.env.JWT_AUDIENCE,
                issuer: process.env.JWT_ISSUER
            });

            req._id = decoded._id;
            req.email = decoded.sub;

            next();
        } catch (error) {
            next(error);
        }
    }

    // Refresh Token
    static refreshToken() {
        return [
            body("refreshToken").notEmpty().withMessage("Refresh token is required"),
            this.validationHandler
        ];
    }

    static validationHandler(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return next(new ClientError(400, errorMessages));
        }
        next();
    }

    static verifyRefreshToken(req, res, next) {
        const instance = new AuthMiddleware();
        try {
            const token = req.body.refreshToken;
            if (!token) return next(new ClientError(401, "Refresh token not provided"));

            const decoded = instance.verifyToken(token, process.env.JWT_KEY, {
                type: process.env.JWT_REFRESH,
                audience: process.env.JWT_AUDIENCE,
                issuer: process.env.JWT_ISSUER
            });

            req._id = decoded._id;
            req.email = decoded.sub;

            next();
        } catch (error) {
            next(error);
        }
    }

}

module.exports = AuthMiddleware;

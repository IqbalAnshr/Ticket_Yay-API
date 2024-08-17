const { success } = require('../utils/respon');
const authService = require('../services/authService');


class AuthController {

    async register(req, res, next) {
        try {
            await authService.register(req.body);
            success(res, 'User registered successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { token, refreshToken } = await authService.login(req.body);
            success(res, 'User logged in successfully', 200, { token, refreshToken });
        } catch (error) {
            next(error);
        }

    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await authService.logout(req._id, refreshToken);
            success(res, 'User logged out successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const token = await authService.refreshToken(req._id, req.email, refreshToken);
            success(res, 'Token refreshed successfully', 200, { token });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController()
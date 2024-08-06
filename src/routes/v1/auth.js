const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/authController');
const UserMiddleware = require('../../middlewares/userMiddleware');
const AuthMiddleware = require('../../middlewares/authMiddleware');


router.post('/register', UserMiddleware.userRegisterValidation(), AuthController.register);
router.post('/login', UserMiddleware.userLoginValidation(), AuthController.login);
router.post('/logout', AuthMiddleware.refreshToken(), AuthMiddleware.auth, AuthController.logout);
router.post('/refresh-token', AuthMiddleware.refreshToken(), AuthMiddleware.verifyRefreshToken, AuthController.refreshToken);


module.exports = router
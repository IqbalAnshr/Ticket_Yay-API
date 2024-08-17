const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const UserMiddleware = require('../../middlewares/userMiddleware');
const AuthMiddleware = require('../../middlewares/authMiddleware');


router.post('/register', UserMiddleware.userRegisterValidation(), authController.register);
router.post('/login', UserMiddleware.userLoginValidation(), authController.login);
router.post('/logout', AuthMiddleware.refreshToken(), AuthMiddleware.auth, authController.logout);
router.post('/refresh-token', AuthMiddleware.refreshToken(), AuthMiddleware.verifyRefreshToken, authController.refreshToken);


module.exports = router
const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/userController');
const UserMiddleware = require('../../middlewares/userMiddleware');
const MulterMiddleware = require('../../middlewares/multerMiddleware');
const AuthMiddleware = require('../../middlewares/authMiddleware');
const { route } = require('./auth');

router.get('/profile/:username?', UserController.getUserProfile);
router.put('/profile', AuthMiddleware.auth, UserMiddleware.userUpdateValidation(), UserController.updateProfile);
router.put('/change-password', AuthMiddleware.auth, UserMiddleware.changePasswordValidation(), UserController.changePassword);
router.put('/profile-picture', AuthMiddleware.auth, MulterMiddleware.uploadMiddleware, UserController.updateProfilePicture);
router.delete('/profile-picture', AuthMiddleware.auth, UserController.deleteProfilePicture);
module.exports = router
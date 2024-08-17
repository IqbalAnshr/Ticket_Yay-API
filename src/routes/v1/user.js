const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const UserMiddleware = require('../../middlewares/userMiddleware');
const MulterMiddleware = require('../../middlewares/multerMiddleware');
const AuthMiddleware = require('../../middlewares/authMiddleware');
const { route } = require('./auth');

router.get('/profile/:username?', AuthMiddleware.optionalAuth, userController.getUserProfile);
router.put('/profile', AuthMiddleware.auth, UserMiddleware.userUpdateValidation(), userController.updateProfile);
router.put('/change-password', AuthMiddleware.auth, UserMiddleware.changePasswordValidation(), userController.changePassword);
router.put('/profile-picture', AuthMiddleware.auth, MulterMiddleware.uploadProfilePictureMiddleware, userController.updateProfilePicture);
router.delete('/profile-picture', AuthMiddleware.auth, userController.deleteProfilePicture);
module.exports = router
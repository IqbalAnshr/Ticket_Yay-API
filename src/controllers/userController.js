const userService = require('../services/userService');
const { success } = require('../utils/respon');

class UserController {

    async getUserProfile(req, res, next) {
        try {
            const userProfile = await userService.getProfile(req._id, req.params.username);
            success(res, 'User profile fetched successfully', 200, userProfile,);

        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            await userService.updateProfile(req._id, req.body);
            success(res, 'Profile updated successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async updateProfilePicture(req, res, next) {
        try {
            await userService.updateProfilePicture(req._id, req.profile_picture);
            success(res, 'Profile picture updated successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async deleteProfilePicture(req, res, next) {
        try {
            await userService.deleteProfilePicture(req._id);
            success(res, 'Profile picture deleted successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const { old_password, new_password } = req.body;
            await userService.changePassword(req._id, old_password, new_password);
            success(res, 'Password changed successfully', 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
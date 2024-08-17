const bcrypt = require('bcrypt');
const ClientError = require('../errors/clientError');
const User = require('../databases/models/user');
const fs = require('fs/promises');
const config = require('../../config/multer');


class UserService {

    async #findUserByUsernameOrAuthId(authenticatedUserId, targetUsername) {
        const user = targetUsername
            ? await User.findOne({ username: targetUsername })
            : await User.findById(authenticatedUserId);

        if (!user) throw new ClientError(404, 'User not found');

        return user;
    }

    #createUserProfile(user, isUserAuthenticated) {
        return {
            _id: user._id,
            name: user.name,
            username: user.username,
            profile_picture: user.profile_picture,
            ...(isUserAuthenticated && {
                email: user.email,
                birthdate: user.birthdate,
                gender: user.gender
            })
        };
    }

    async getProfile(authenticatedUserId, targetUsername) {
        const user = await this.#findUserByUsernameOrAuthId(authenticatedUserId, targetUsername);

        const isUserAuthenticated = authenticatedUserId && user._id.toString() === authenticatedUserId;
        const userProfile = this.#createUserProfile(user, isUserAuthenticated);

        return  userProfile;
    }

    async updateProfile(userId, data) {
        const userData = {
            name: {
                first_name: data.first_name ?? (await User.findById(userId)).name.first_name,
                last_name: data.last_name ?? (await User.findById(userId)).name.last_name
            },
            username: data.username,
            email: data.email,
            birthdate: data.birthdate,
            gender: data.gender,
            updated_at: new Date()
        };

        await User.updateOne({ _id: userId }, { $set: userData });
    }

    async updateProfilePicture(userId, profile_picture) {
        const user = await User.findById(userId);
        const uploadPath = config.uploadDirectoryProfileImage;

        if (user.profile_picture) {
            const filePath = `${uploadPath}/${user.profile_picture}`;
            try {
                await fs.access(filePath)
                await fs.unlink(filePath);
            } catch (error) {
                // Ignore errors while deleting the old file
            }
        }

        user.profile_picture = profile_picture;
        user.updated_at = new Date()
        await user.save();
    }

    async deleteProfilePicture(userId) {
        const user = await User.findById(userId);
        const uploadPath = config.uploadDirectoryProfileImage;

        if (user.profile_picture) {
            const filePath = `${uploadPath}/${user.profile_picture}`;
            try {
                await fs.access(filePath)
                await fs.unlink(filePath);
            } catch (error) {
                // Ignore errors while deleting the old file
            }
        }

        user.profile_picture = null;
        user.updated_at = new Date()
        await user.save();
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) throw new ClientError(404, 'User not found');

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) throw new ClientError(400, 'Invalid password');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.updated_at = new Date()
        await user.save();
    }
}

module.exports = new UserService();
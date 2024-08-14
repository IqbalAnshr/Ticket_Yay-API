const bcrypt = require('bcrypt');
const ClientError = require('../errors/clientError');
const User = require('../databases/models/user');
const fs = require('fs/promises');


class UserService {
    async getProfile(authId, username) {
        let user;

        try {
            if (!username) {
                user = await User.findById(authId).select('-password');
            } else {
                user = await User.findOne({ username }).select('-password');
            }
        } catch (error) {
            throw new Error('An error occurred while fetching the user');
        }

        if (!user) {
            throw new ClientError(404, 'User not found');
        }

        const isUserAuthenticated = authId && user._id.toString() === authId;

        const userProfile = {
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

        return { isUserAuthenticated, userProfile };
    }

    async updateProfile(userId, data) {
        if (!data.first_name || !data.last_name) {
            const user = await User.findById(userId).select('name');
            data.first_name = user.name.first_name;
            data.last_name = user.name.last_name;
        }
        await User.updateOne({ _id: userId }, {
            $set: {
                name: {
                    first_name: data.first_name,
                    last_name: data.last_name
                },
                username: data.username,
                email: data.email,
                birthdate: data.birthdate,
                gender: data.gender,
                updated_at: new Date()
            }
        });
    }

    async updateProfilePicture(userId, profile_picture) {
        const user = await User.findById(userId);

        const uploadPath = process.env.UPLOAD_DIRECTORY;

        if (!uploadPath) {
            throw new Error('UPLOAD_DIRECTORY is not set');
        }

        console.log("upload path", uploadPath);
        console.log("profile picture", profile_picture);

        if (user.profile_picture) {
            const filePath = `${uploadPath}/${user.profile_picture}`;
            console.log("file path", filePath);
            try {
                await fs.access(filePath)
                await fs.unlink(filePath);
            } catch (error) {
                // Ignore errors while deleting the old file
            }
        }

        user.profile_picture = profile_picture;
        await user.save();
    }

    async deleteProfilePicture(userId) {
        const user = await User.findById(userId);

        const uploadPath = process.env.UPLOAD_DIRECTORY;

        if (user.profile_picture) {
            const filePath = `${uploadPath}/${user.profile_picture}`;
            console.log("file path", filePath);
            try {
                await fs.access(filePath)
                await fs.unlink(filePath);
            } catch (error) {
                // Ignore errors while deleting the old file
            }
        }

        user.profile_picture = null;
        await user.save();
        return
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ClientError(404, 'User not found');
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new ClientError(400, 'Invalid password');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        return user;
    }
}

module.exports = new UserService();
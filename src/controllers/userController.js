const { validationResult } = require('express-validator');

const ClientError = require('../errors/clientError');

const UserService = require('../services/userService');
const logger = require("../utils/logger");

const { verify } = require('../utils/token');

class UserController {

    async getUserProfile(req, res) {
        try {
            // optional authentication (lebih bagus di pindahkan ke middleware)
            const token = req.headers.authorization?.split(' ')[1];
            let authId;
            if (token) {
                try {
                    const decoded = verify(token, process.env.JWT_KEY);
                    authId = decoded._id;
                } catch (error) {

                }
            }

            const { isUserAuthenticated, userProfile } = await UserService.getProfile(authId, req.params.username);
            const response = {
                status: 'success',
                data: userProfile,
            };

            if (isUserAuthenticated) {
                response.links = [
                    { rel: 'self', method: req.method, href: req.originalUrl },
                    { rel: 'update-profile', method: 'PUT', href: '/api/v1/user/profile' },
                    { rel: 'update-profile-picture', method: 'PUT', href: '/api/v1/user/profile-picture' },
                    { rel: 'delete-profile-picture', method: 'DELETE', href: '/api/v1/user/profile-picture' },
                    { rel: 'change-password', method: 'PUT', href: '/api/v1/user/change-password' },
                    { rel: 'logout', method: 'POST', href: '/api/v1/auth/logout' }
                ];
            } else {
                response.links = [
                    { rel: 'self', method: 'GET', href: req.originalUrl }
                ];
            }

            return res.status(200).json(response);
        } catch (error) {

            if (error.name === 'ClientError') {
                return res.status(400).json({
                    status: 'error',
                    name: error.name,
                    messages: error.messages,
                    links: [
                        { rel: 'self', method: req.method, href: req.originalUrl }
                    ]
                });
            }

            logger.error(error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                links: [
                    { rel: 'self', method: req.method, href: req.originalUrl }
                ]
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorsMessage = errors.array().map(error => error.msg);
                throw new ClientError(400, errorsMessage);
            }

            await UserService.updateProfile(req._id, req.body);
            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                links: [
                    { rel: 'self', method: req.method, href: req.originalUrl },
                    { rel: 'profile', method: 'GET', href: `/api/v1/user/profile` }
                ]
            });
        } catch (error) {
            if (error.name === 'ClientError') {
                return res.status(400).json({
                    status: 'error',
                    name: error.name,
                    messages: error.messages,
                    links: [
                        { rel: 'self', method: req.method, href: req.originalUrl },
                        { rel: 'profile', method: 'GET', href: `/api/v1/user/profile` }
                    ]
                });
            }

            logger.error(error);
            return res.status(500).json({
                status: 'error',
                message: error.message,
                links: [
                    { rel: 'self', href: req.originalUrl },
                    { rel: 'profile', href: `/api/v1/user/profile` }
                ]
            });
        }
    }

    async updateProfilePicture(req, res) {
        try {
            await UserService.updateProfilePicture(req._id, req.profile_picture);

            res.status(200).json({
                status: 'success',
                message: 'Profile picture updated successfully',
                links: [
                    { rel: 'self', method: req.method, href: req.originalUrl },
                    { rel: 'profile', method: 'GET', href: `/api/v1/user/profile` }
                ]
            });
        } catch (error) {
            if (error.name === 'ClientError') {
                return res.status(400).json({
                    status: 'error',
                    name: error.name,
                    message: error.message,
                    links: [
                        { rel: 'self', method: req.method, href: req.originalUrl },
                        { rel: 'profile', method: 'GET', href: `/api/v1/user/profile` }
                    ]
                });
            }

            logger.error(error);
            return res.status(500).json({
                status: 'error',
                message: error.message,
                links: [
                    { rel: 'self', method: req.method, href: req.originalUrl },
                    { rel: 'profile', method: 'GET', href: `/api/v1/user/profile` }
                ]
            });
        }
    }

    async deleteProfilePicture(req, res) {
        try {
            await UserService.deleteProfilePicture(req._id);
            res.status(200).json({
                status: 'success',
                message: 'Profile picture deleted successfully',
                links: [
                    { rel: 'self', method: req.method, href: req.originalUrl },
                    { rel: 'profile', method: 'GET', href: `/api/v1/user/profile` }
                ]
            });
        } catch (error) {
            if (error.name === 'ClientError') {
                return res.status(400).json({
                    status: 'error',
                    name: error.name,
                    message: error.message,
                    links: [
                        { rel: 'self', method: req.method, href: req.originalUrl },
                        { rel: 'profile', method: 'GET', href: `/api/v1/user/profile` }
                    ]
                });
            }

            logger.error(error);
            return res.status(500).json({
                status: 'error',
                message: error.message,
                links: [
                    { rel: 'self', href: req.originalUrl },
                    { rel: 'profile', href: `/api/v1/user/profile` }
                ]
            });
        }
    }

    async changePassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorsMessage = errors.array().map(error => error.msg);
                throw new ClientError(400, errorsMessage);
            }
            const { old_password, new_password } = req.body;

            const user = await UserService.changePassword(req._id, old_password, new_password);

            res.status(200).json({
                status: 'success',
                message: 'Password changed successfully',
                links: [
                    {
                        rel: 'self',
                        method: req.method,
                        href: req.originalUrl
                    },
                    {
                        rel: 'profile',
                        method: 'GET',
                        href: `/api/v1/user/profile`
                    },
                    {
                        rel: 'logout',
                        method: 'POST',
                        href: '/api/v1/auth/logout'
                    }
                ]

            });
        } catch (error) {
            if (error.name === 'ClientError') {
                return res.status(400).json({
                    status: 'error',
                    name: error.name,
                    messages: error.messages,
                    links: [
                        { rel: 'self', method: req.method, href: req.originalUrl },
                        { rel: 'profile', method: 'GET', href: `/api/v1/user/profile` },
                        { rel: 'forget-password', method: 'POST', href: '/api/v1/auth/forget-password' },
                        { rel: 'logout', method: 'POST', href: '/api/v1/auth/logout' }
                    ]
                });
            }
            logger.error(error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                links: [
                    { rel: 'self', method: req.method, href: req.originalUrl },
                    { rel: 'profile', method: 'GET', href: `/api/v1/user/profile` },
                    { rel: 'forget-password', method: 'POST', href: '/api/v1/auth/forget-password' },
                ]
            });
        }
    }
}

module.exports = new UserController();
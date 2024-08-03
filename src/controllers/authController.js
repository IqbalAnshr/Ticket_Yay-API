const { validationResult } = require('express-validator');

const ClientError = require('../errors/clientError');

const AuthService = require('../services/authService');
const logger = require("../utils/logger");

class AuthController {

    async register(req, res) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorsMessage = errors.array().map(error => error.msg);
                throw new ClientError(400, errorsMessage);
            }

            const userData = req.body;
            const user = await AuthService.register(userData);
            res.status(201).json({
                status: "success",
                message: "User created successfully",
                data: user,
                links: [
                    {
                        rel: "self",
                        href: req.originalUrl
                    },
                    {
                        rel: "login",
                        href: "/api/v1/auth/login"
                    },
                    {
                        rel: "logout",
                        href: "/api/v1/auth/logout",
                    }
                ]
            });
        } catch (error) {

            if (error.name == "ClientError") {
                return res.status(400).json({
                    status: "error", name: error.name, messages: error.messages, links: [{
                        rel: "self",
                        href: req.originalUrl
                    },
                    {
                        rel: "login",
                        href: "/api/v1/auth/login"
                    },
                    {
                        rel: "logout",
                        href: "/api/v1/auth/logout",
                    }]
                });
            }

            logger.error(error);
            return res.status(500).json({ status: "error", name: error.name, message: error.message });
        }
    }

    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorsMessage = errors.array().map(error => error.msg);
                throw new ClientError(400, errorsMessage);
            }

            const userData = req.body;
            const { token, refreshToken } = await AuthService.login(userData);
            res.status(200).json({
                status: "success",
                message: "User logged in successfully",
                data: {
                    token,
                    refreshToken
                },
                links: [
                    {
                        rel: "self",
                        href: req.originalUrl
                    },
                    {
                        rel: "logout",
                        href: "/api/v1/auth/logout",
                    },
                    {
                        rel: "profile",
                        href: "/api/v1/user/profile"
                    }
                ]
            });
        } catch (error) {
            if (error.name == "ClientError") {
                return res.status(400).json({
                    status: "error", name: error.name, message: error.message, links: [
                        {
                            rel: "self",
                            href: req.originalUrl
                        },
                        {
                            rel: "register",
                            href: "/api/v1/auth/register"
                        }
                    ]
                });
            }

            logger.error(error);
            res.status(500).json({ status: "error", message: error.message });
        }

    }

    async logout(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorsMessage = errors.array().map(error => error.msg);
                throw new ClientError(400, errorsMessage);
            }

            const refreshToken = req.body.refreshToken;
            const _id = req._id

            await AuthService.logout(_id, refreshToken);
            res.status(200).json({
                status: "success",
                message: "User logged out successfully",
                links: [
                    {
                        rel: "self",
                        href: req.originalUrl
                    },
                    {
                        rel: "login",
                        href: "/api/v1/auth/login"
                    },
                    {
                        rel: "register",
                        href: "/api/v1/auth/register"
                    }
                ]
            });
        } catch (error) {
            if (error.name == "ClientError") {
                return res.status(400).json({
                    status: "error", name: error.name, message: error.message, links: [
                        {
                            rel: "self",
                            href: req.originalUrl
                        },
                        {
                            rel: "login",
                            href: "/api/v1/auth/login"
                        }
                    ]
                });
            }

            logger.error(error);
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    async refreshToken(req, res) {
        try {
            const refreshToken = req.body.refreshToken;
            const _id = req._id
            const email = req.email

            console.log(req._id, req.email);

            const token  = await AuthService.refreshToken(_id, email, refreshToken);
            res.status(200).json({
                status: "success",
                message: "New Token refreshed successfully",
                data: {
                    token
                },
                links: [
                    {
                        rel: "self",
                        href: req.originalUrl
                    },
                    {
                        rel: "logout",
                        href: "/api/v1/auth/logout",
                    }
                ]
            });
        } catch (error) {
            if (error.name == "ClientError") {
                return res.status(401).json({
                    status: "error", name: error.name, message: error.message, links: [
                        {
                            rel: "self",
                            href: req.originalUrl
                        },
                        {
                            rel: "login",
                            href: "/api/v1/auth/login"
                        },
                        {
                            rel: "register",
                            href: "/api/v1/auth/register"
                        },
                    ]
                });
            }
            res.status(500).json({ status: "error", message: error.message });
        }
    }
}

module.exports = new AuthController()
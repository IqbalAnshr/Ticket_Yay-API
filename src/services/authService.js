const bcrypt = require('bcrypt');

const redisClient = require('./redisService');
const User = require('../databases/models/user');

const ClientError = require('../errors/clientError');

const { sign } = require('../utils/token');
const logger = require('../utils/logger');


class AuthService {

    async register(userData) {
        const { first_name, last_name, birthdate, gender, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);

        const username = "User" + Date.now();

        const newUser = new User({
            name: { first_name, last_name },
            username,
            birthdate,
            gender,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        return newUser;
    }

    async login({ email, password }) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new ClientError(400, 'User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ClientError(400, 'Invalid password');
        }

        const jwtAccessTime = parseInt(process.env.JWT_ACCESS_TIME, 10);
        const jwtRefreshTime = parseInt(process.env.JWT_REFRESH_TIME, 10);

        const token = sign({ _id: user._id, type: process.env.JWT_ACCESS, }, process.env.JWT_KEY, {
            subject: email,
            expiresIn: jwtAccessTime,
            audience: process.env.JWT_AUDIENCE,
            issuer: process.env.JWT_ISSUER,
        });

        const refreshToken = sign({ _id: user._id, type: process.env.JWT_REFRESH, }, process.env.JWT_KEY, {
            subject: email,
            expiresIn: jwtRefreshTime,
            audience: process.env.JWT_AUDIENCE,
            issuer: process.env.JWT_ISSUER,
        });

        await redisClient.set(`${user._id}:${refreshToken}`, refreshToken, { EX: jwtRefreshTime });

        return { token, refreshToken };
    }

    async logout(_id, refreshToken) {
        await redisClient.del(`${_id}:${refreshToken}`);
        return
    }

    async refreshToken(_id, email, refreshToken) {

        const refreshTokenValue = await redisClient.GET(`${_id}:${refreshToken}`)

        if (!refreshTokenValue) {
            throw new ClientError(401, 'Unauthorized');
        }

        const jwtAccessTime = parseInt(process.env.JWT_ACCESS_TIME, 10);
        const newAccesToken = sign({ _id: _id, type: process.env.JWT_ACCESS }, process.env.JWT_KEY, {
            subject: email,
            expiresIn: jwtAccessTime,
            audience: process.env.JWT_AUDIENCE,
            issuer: process.env.JWT_ISSUER,
        });

        return newAccesToken;
    }
}

module.exports = new AuthService();

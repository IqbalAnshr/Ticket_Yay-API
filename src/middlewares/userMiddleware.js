const { body } = require('express-validator');

const User = require('../databases/models/user');

class UserMiddleware {

    static userRegisterValidation() {

        return [
            body('first_name').
                notEmpty().
                trim().
                withMessage('first_name is required'),

            body('last_name').
                notEmpty().
                trim().
                withMessage('last_name is required'),

            body('birthdate').
                notEmpty().
                trim().
                withMessage('birthdate is required'),

            body('birthdate').
                isISO8601().
                withMessage('Invalid date format'),

            body('gender').
                notEmpty().
                trim().
                withMessage('gender is required'),

            body('gender').
                isIn(['male', 'female']).
                withMessage('Invalid gender'),

            body('email').
                notEmpty().
                trim().
                withMessage('Email is required'),

            body('email').
                isEmail().
                normalizeEmail().
                withMessage('Invalid email address'),

            body('email').
                custom(async (value, { req }) => {
                    const user = await User.findOne({ email: value });
                    if (user) {
                        throw new Error('Email already exists');
                    }
                    return true;
                }),

            body('password').
                notEmpty().
                trim().
                withMessage('Password is required'),

            body('password').
                isLength({ min: 8 }).
                trim().
                withMessage('Password must be at least 8 characters'),

            body('password').
                custom((value, { req }) => {
                    if (!value.match(/\d/) || !value.match(/[a-z]/) || !value.match(/[A-Z]/)) {
                        throw new Error('Passwords at least have number, uppercase and lowercase character');
                    }
                    return true;
                }),

            body('confirmPassword').
                notEmpty().
                trim().
                withMessage('Confirm password is required'),

            body('password').
                trim().
                custom((value, { req }) => {
                    if (value !== req.body.confirmPassword) {
                        throw new Error('Passwords do not match');
                    }
                    return true;
                }),
        ]


    }


    static userLoginValidation() {

        return [
            body('email').
                notEmpty().
                withMessage('Email is required'),

            body('email').
                isEmail().
                withMessage('Invalid email address'),

            body('password').
                notEmpty().
                withMessage('Password is required'),
        ]

    }


    static userUpdateValidation() {
        return [
            body('first_name').
                notEmpty().
                trim().
                withMessage('first_name is required'),

            body('last_name').
                notEmpty().
                trim().
                withMessage('last_name is required'),

            body('birthdate').
                notEmpty().
                trim().
                withMessage('birthdate is required'),

            body('birthdate').
                isISO8601().
                withMessage('Invalid date format'),

            body('gender').
                notEmpty().
                trim().
                withMessage('gender is required'),

            body('gender').
                isIn(['male', 'female']).
                withMessage('Invalid gender'),

            body('username').
                notEmpty().
                trim().
                withMessage('Username is required'),

            body('username').
                isLength({ min: 5 }).
                trim().
                withMessage('Username must be at least 3 characters'),

            body('username').
                isAlphanumeric().
                trim().
                withMessage('Username must be alphanumeric'),

            body('username').
                custom(async (value, { req }) => {
                    const user = await User.findOne({ username: value });
                    if (user) {
                        throw new Error('Username already exists');
                    }
                    return true;
                }),

            body('email').
                notEmpty().
                trim().
                withMessage('Email is required'),

            body('email').
                isEmail().
                normalizeEmail().
                withMessage('Invalid email address'),

            body('email').
                custom(async (value, { req }) => {
                    const user = await User.findOne({ email: value });
                    if (user) {
                        throw new Error('Email already exists');
                    }
                    return true;
                }),

            body('phone_number').
                isAlphanumeric().
                trim().
                withMessage('Phone number must be alphanumeric'),

            body('phone_number').
                isLength({ min: 10 }).
                trim().
                withMessage('Phone number must be at least 10 characters'),

            body('phone_number').
                custom(async (value, { req }) => {
                    const user = await User.findOne({ phone_number: value });
                    if (user) {
                        throw new Error('Phone number already exists');
                    }
                    return true;
                }),
        ]
    }

}


module.exports = UserMiddleware;
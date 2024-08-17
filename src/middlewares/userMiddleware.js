const { body, validationResult } = require('express-validator');
const ClientError = require('../errors/clientError');
const User = require('../databases/models/user');

class UserMiddleware {

    #validateName(field) {
        return [
            body(field)
                .notEmpty()
                .trim()
                .withMessage(`${field} is required`)
        ];
    }

    #validateBirthdate() {
        return [
            body('birthdate')
                .notEmpty()
                .trim()
                .withMessage('birthdate is required')
                .isISO8601()
                .withMessage('Invalid date format')
        ];
    }

    #validateGender() {
        return [
            body('gender')
                .notEmpty()
                .trim()
                .withMessage('gender is required')
                .isIn(['male', 'female'])
                .withMessage('Invalid gender')
        ];
    }

    #validateEmail() {
        return [
            body('email')
                .notEmpty()
                .trim()
                .withMessage('Email is required')
                .isEmail()
                .normalizeEmail()
                .withMessage('Invalid email address'),
        ];
    }

    #validateEmailAvailability() {
        return [
            body('email')
                .custom(async (value) => {
                    const user = await User.findOne({ email: value });
                    if (user) {
                        throw new Error('Email already exists');
                    }
                    return true;
                })
        ];
    }

    #validatePassword(field = 'password') {
        return [
            body(field)
                .notEmpty()
                .trim()
                .withMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
                .isLength({ min: 8 })
                .trim()
                .withMessage('Password must be at least 8 characters')
                .custom((value) => {
                    if (!value.match(/\d/) || !value.match(/[a-z]/) || !value.match(/[A-Z]/)) {
                        throw new Error('Passwords must have at least one number, uppercase, and lowercase character');
                    }
                    return true;
                })
        ];
    }

    #validateConfirmPassword(fieldComparison) {
        return [
            body('confirm_password')
                .notEmpty()
                .trim()
                .withMessage('Confirm password is required'),
            body(fieldComparison)
                .custom((value, { req }) => {
                    if (value !== req.body.confirm_password) {
                        throw new Error('Passwords do not match');
                    }
                    return true;
                })
        ];
    }

    #validateOptionalName(field) {
        return [
            body(field)
                .optional()
                .trim()
                .notEmpty()
                .withMessage(`${field} cannot be empty when provided`)
        ];
    }

    #validateOptionalBirthdate() {
        return [
            body('birthdate')
                .optional()
                .trim()
                .notEmpty()
                .withMessage('Birthdate cannot be empty when provided')
                .optional()
                .isISO8601()
                .withMessage('Invalid date format')
        ];
    }

    #validateOptionalGender() {
        return [
            body('gender')
                .optional()
                .trim()
                .notEmpty()
                .withMessage('Gender cannot be empty when provided')
                .optional()
                .isIn(['male', 'female'])
                .withMessage('Invalid gender')
        ];
    }

    #validateOptionalEmail() {
        return [
            body('email')
                .optional()
                .trim()
                .notEmpty()
                .withMessage('Email cannot be empty when provided')
                .optional()
                .isEmail()
                .normalizeEmail()
                .withMessage('Invalid email address'),
        ];
    }

    #validateOptionalUsername() {
        return [
            body('username')
                .optional()
                .trim()
                .notEmpty()
                .withMessage('Username cannot be empty when provided')
                .optional()
                .isLength({ min: 3 })
                .withMessage('Username must be at least 3 characters')
                .optional()
                .isAlphanumeric()
                .withMessage('Username must be alphanumeric')
                .optional()
                .custom(async (value) => {
                    const user = await User.findOne({ username: value });
                    if (user) {
                        throw new Error('Username already exists');
                    }
                    return true;
                })
        ];
    }

    #validateOptionalPhoneNumber() {
        return [
            body('phone_number')
                .optional()
                .trim()
                .notEmpty()
                .withMessage('Phone number cannot be empty when provided')
                .optional()
                .isAlphanumeric()
                .withMessage('Phone number must be alphanumeric')
                .optional()
                .isLength({ min: 10 })
                .withMessage('Phone number must be at least 10 characters')
                .optional()
                .custom(async (value) => {
                    const user = await User.findOne({ phone_number: value });
                    if (user) {
                        throw new Error('Phone number already exists');
                    }
                    return true;
                })
        ];
    }

    handleValidationErrors(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(err => err.msg);
            return next(new ClientError(400, errorMessages));
        }
        next();
    }

    // Public validation methods
    static userRegisterValidation() {
        const instance = new UserMiddleware();
        return [
            ...instance.#validateName('first_name'),
            ...instance.#validateName('last_name'),
            ...instance.#validateBirthdate(),
            ...instance.#validateGender(),
            ...instance.#validateEmail(),
            ...instance.#validateEmailAvailability(),
            ...instance.#validatePassword(),
            ...instance.#validateConfirmPassword('password'),
            instance.handleValidationErrors
        ];
    }

    static userLoginValidation() {
        const instance = new UserMiddleware();
        return [
            ...instance.#validateEmail(),
            ...instance.#validatePassword('password'),
             instance.handleValidationErrors
        ];
    }

    static userUpdateValidation() {
        const instance = new UserMiddleware();
        return [
            ...instance.#validateOptionalName('first_name'),
            ...instance.#validateOptionalName('last_name'),
            ...instance.#validateOptionalBirthdate(),
            ...instance.#validateOptionalGender(),
            ...instance.#validateOptionalUsername(),
            ...instance.#validateOptionalEmail(),
            ...instance.#validateEmailAvailability(),
            ...instance.#validateOptionalPhoneNumber(),
             instance.handleValidationErrors
        ];
    }

    static changePasswordValidation() {
        const instance = new UserMiddleware();
        return [
            ...instance.#validatePassword('old_password'),
            ...instance.#validatePassword('new_password'),
            ...instance.#validateConfirmPassword('new_password'),
             instance.handleValidationErrors
        ];
    }
}

module.exports = UserMiddleware;
const { body, check, validationResult } = require('express-validator');
const Event = require('../databases/models/event');
const ClientError = require('../errors/clientError');

class EventMiddleware {

    #checkName(isOptional = false) {
        return [
            check('name')
                .optional(isOptional)
                .notEmpty().withMessage('Event name is required')
                .isLength({ max: 100 }).withMessage('Event name can be at most 100 characters'),
        ];
    }

    #checkDescription(isOptional = false) {
        return [
            check('description')
                .optional(isOptional)
                .isLength({ max: 500 }).withMessage('Description can be at most 500 characters'),
        ];
    }

    #checkDate(isOptional = false) {
        return [
            check('date')
                .optional(isOptional)
                .isISO8601().withMessage('Invalid date format'),
        ];
    }

    #checkLocation(isOptional = false) {
        return [
            check('province')
                .optional(isOptional)
                .notEmpty().withMessage('Province is required'),
            check('city')
                .optional(isOptional)
                .notEmpty().withMessage('City is required'),
            check('address')
                .optional(isOptional)
                .notEmpty().withMessage('Address is required'),
        ];
    }

    #checkSocialMedia() {
        return [
            check('facebook')
                .optional()
                .isURL().withMessage('Invalid Facebook URL'),
            check('twitter')
                .optional()
                .isURL().withMessage('Invalid Twitter URL'),
            check('instagram')
                .optional()
                .isURL().withMessage('Invalid Instagram URL'),
            check('website')
                .optional()
                .isURL().withMessage('Invalid Website URL'),
        ];
    }

    #checkTicketType(isOptional = false) {
        return [
            check('*.type')
                .optional(isOptional)
                .notEmpty().withMessage('Type is required')
                .isLength({ max: 100 }).withMessage('Type name can be at most 100 characters'),
            check('*.price')
                .optional(isOptional)
                .notEmpty().withMessage('Price is required')
                .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
            check('*.limit')
                .optional(isOptional)
                .notEmpty().withMessage('Limit is required')
                .isInt({ gt: 0 }).withMessage('Limit must be greater than 0'),
            check('*.until')
                .notEmpty().withMessage('Until date is required')
                .isISO8601().withMessage('Invalid date format'),
            check('*.status')
                .optional(isOptional)
                .notEmpty().withMessage('Status is required')
                .isIn(['open', 'pending', 'closed', 'archived']).withMessage('Invalid status'),
        ];
    }


    // Validasi untuk membuat event baru
    validateCreateEvent() {
        return [
            ...this.#checkName(),
            ...this.#checkDescription(),
            ...this.#checkDate(),
            ...this.#checkLocation(),
            ...this.#checkSocialMedia(),
            this.handleValidationErrors
        ];
    }

    // Validasi untuk update event
    validateUpdateEvent() {
        return [
            ...this.#checkName(true),
            ...this.#checkDescription(true),
            ...this.#checkDate(true),
            ...this.#checkLocation(true),
            ...this.#checkSocialMedia(),
            this.handleValidationErrors
        ];
    }

    validateAddEventTicketType() {
        return [
            body().isArray({ min: 1 }).withMessage('At least one ticket type is required and should be an array'),
            ...this.#checkTicketType(),
            this.handleValidationErrors
        ];
    }

    validateUpdateEventTicketType() {
        return [
            ...this.#checkTicketType(true),
            this.handleValidationErrors
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

    async isOwnerEvent(req, res, next) {
        try {
            const event = await Event.findById(req.params.id, { _id: 1, organizer: 1 });
            if (req._id != event.organizer) {
                return next(new ClientError(403, 'You are not the owner of this event'));
            }
            next();
        } catch (error) {
            if (error.name === 'CastError') {
                return next(new ClientError(404, 'Event not found'));
            }
            next(error);
        }
    }
}

module.exports = new EventMiddleware();

const { check, validationResult } = require('express-validator');
const Event = require('../databases/models/event');
const ClientError = require('../errors/clientError');

class EventMiddleware {
    // Validasi untuk membuat event baru
    validateCreateEvent() {
        return [
            check('name')
                .notEmpty().withMessage('Event name is required')
                .isLength({ max: 100 }).withMessage('Event name can be at most 100 characters'),

            check('description')
                .optional()
                .isLength({ max: 500 }).withMessage('Description can be at most 500 characters'),

            check('date')
                .notEmpty().withMessage('Event date is required')
                .isISO8601().withMessage('Invalid date format'),

            check('location.province')
                .notEmpty().withMessage('Province is required'),

            check('location.city')
                .notEmpty().withMessage('City is required'),

            check('location.address')
                .notEmpty().withMessage('Address is required'),

            // check('organizer')
            //     .notEmpty().withMessage('Organizer is required')
            //     .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid organizer ID'),

            check('ticket_types')
                .isArray({ min: 1 }).withMessage('At least one ticket type is required'),

            check('ticket_types.*.type')
                .notEmpty().withMessage('Ticket type is required')
                .isIn(['regular', 'flash_sale', 'early_bird']).withMessage('Invalid ticket type'),

            check('ticket_types.*.price')
                .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),

            check('ticket_types.*.limit')
                .isInt({ gt: 0 }).withMessage('Limit must be greater than 0'),

            check('ticket_types.*.until')
                .notEmpty().withMessage('Until date is required')
                .isISO8601().withMessage('Invalid date format'),

            check('ticket_types.*.status')
                .notEmpty().withMessage('Status is required')
                .isIn(['active', 'sold_out']).withMessage('Invalid status'),

            check('social_media')
                .optional(),

            check('social_media.facebook')
                .optional()
                .isURL().withMessage('Invalid Facebook URL'),

            check('social_media.twitter')
                .optional()
                .isURL().withMessage('Invalid Twitter URL'),

            check('social_media.instagram')
                .optional()
                .isURL().withMessage('Invalid Instagram URL'),

            check('social_media.website')
                .optional()
                .isURL().withMessage('Invalid Website URL'),
            this.handleValidationErrors
        ];
    }

    // Validasi untuk update event
    validateUpdateEvent() {
        return [
            check('name')
                .optional()
                .isLength({ max: 100 }).withMessage('Event name can be at most 100 characters'),

            check('description')
                .optional()
                .isLength({ max: 500 }).withMessage('Description can be at most 500 characters'),

            check('date')
                .optional()
                .isISO8601().withMessage('Invalid date format'),

            check('location.province')
                .optional()
                .notEmpty().withMessage('Province is required if provided'),

            check('location.city')
                .optional()
                .notEmpty().withMessage('City is required if provided'),

            check('location.address')
                .optional()
                .notEmpty().withMessage('Address is required if provided'),

            check('ticket_types')
                .optional()
                .isArray().withMessage('Ticket types must be an array if provided'),

            check('ticket_types.*.type')
                .optional()
                .isIn(['regular', 'flash_sale', 'early_bird']).withMessage('Invalid ticket type'),

            check('ticket_types.*.price')
                .optional()
                .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),

            check('ticket_types.*.limit')
                .optional()
                .isInt({ gt: 0 }).withMessage('Limit must be greater than 0'),

            check('ticket_types.*.until')
                .optional()
                .isISO8601().withMessage('Invalid date format'),

            check('ticket_types.*.status')
                .optional()
                .isIn(['active', 'sold_out']).withMessage('Invalid status'),

            check('social_media')
                .optional(),

            check('social_media.facebook')
                .optional()
                .isURL().withMessage('Invalid Facebook URL'),

            check('social_media.twitter')
                .optional()
                .isURL().withMessage('Invalid Twitter URL'),

            check('social_media.instagram')
                .optional()
                .isURL().withMessage('Invalid Instagram URL'),

            check('social_media.website')
                .optional()
                .isURL().withMessage('Invalid Website URL'),
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

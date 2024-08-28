const ClientError = require('../errors/clientError');
const Ticket = require('../databases/models/ticket');


class TicketMiddleware {

    async isOwnerTicket(req, res, next) {
        try {
            const ticket = await Ticket.findById(req.params.id, { _id: 1, user_id: 1 });
            if (req._id != ticket.user_id) {
                return next(new ClientError(403, 'You are not the owner of this ticket'));
            }
            next();
        } catch (error) {
            if (error.name === 'CastError') {
                return next(new ClientError(404, 'Ticket not found'));
            }
            next(error);
        }
    }

    async checkTicketIsValid(req, res, next) {
        try {
            const eventId = req.params.id;
            const ticket = await Ticket.findOne({ barcode: req.body.barcode, event_id: eventId });
            if (ticket.status === "checked-in") return next(new ClientError(400, 'Ticket has already been checked in'));
            if (ticket.status !== "purchased") return next(new ClientError(400, 'Ticket is not active'));
            if (ticket.barcode !== req.body.barcode) return next(new ClientError(400, 'Invalid barcode'));
            next();
        } catch (error) {
            if (error.name === 'CastError') {
                return next(new ClientError(404, 'Ticket not found'));
            }
            next(error);
        }
    }

}

module.exports = new TicketMiddleware();
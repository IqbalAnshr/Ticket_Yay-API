const ticket = require('../databases/models/ticket');
const Ticket = require('../databases/models/ticket');
const ClientError = require('../errors/clientError');
const { getThirtyDaysBeforeToday } = require('../utils/date');

class TicketService {

    #generateUniqueBarcode() {
        const date = new Date();
        return `${Math.floor(Math.random() * 100000)}-${Math.floor(Math.random() * 100000)}-${date.getTime()}`;
    }

    #filterTicketTypes(tickets) {
        return tickets.map(ticket => {
            ticket.event_id.ticket_types = ticket.event_id.ticket_types
                .filter(ticketType => ticketType._id.toString() === ticket.ticket_type_id.toString())
                .map(ticketType => ({
                    _id: ticketType._id,
                    type: ticketType.type,
                }));
            return ticket;
        });
    }

    async createTicket(eventId, ticketTypeId, userId, price) {
        try {
            const ticket = await Ticket.create({
                event_id: eventId,
                user_id: userId,
                ticket_type_id: ticketTypeId,
                barcode: this.#generateUniqueBarcode(),
                status: 'pending',
                price: price,
                created_at: new Date()
            });
            await ticket.save();
            return ticket;
        } catch (error) {
            throw error;
        }
    }

    async getUserTickets(userId, query) {
        const { status, from = getThirtyDaysBeforeToday(), to = new Date(), search, limit = 15, page = 1 } = query;
        const skip = (page - 1) * limit;

        try {
            const filter = {
                user_id: userId,
                status: { $nin: ['expired', 'cancelled'] },
            };

            if (status && status !== 'all') filter.status = status;

            if (from || to) {
                filter.created_at = {};
                if (from) filter.created_at.$gte = new Date(from);
                if (to) filter.created_at.$lte = new Date(to);
            }

            if (search) {
                filter.$or = [
                    { 'event_id.name': { $regex: search, $options: 'i' } },
                    { 'event_id.description': { $regex: search, $options: 'i' } }
                ];
            }

            const tickets = await Ticket.find(filter)
                .populate({
                    path: 'event_id',
                    select: '_id name description image ticket_types status'
                })
                .skip(skip)
                .limit(limit);

            return this.#filterTicketTypes(tickets);
        } catch (error) {
            throw new Error(`Error fetching user tickets: ${error.message}`);
        }
    }

    async getUserTicketById(userId, ticketId) {
        try {
            const ticket = await Ticket.findOne({ _id: ticketId, user_id: userId }).populate({
                path: 'event_id',
                select: '_id name description image ticket_types status'
            });
            if (!ticket) throw new ClientError(404, 'Ticket not found');
            return this.#filterTicketTypes([ticket])[0];
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Ticket not found');
            }
            throw error;
        }
    }

    async getTicketById(id, ticketTypeId) {
        try {
            const ticket = await Ticket.findById(id).populate({
                path: 'event_id',
                select: '_id name description image ticket_types status',
                as: 'event'
            });
            if (!ticket) throw new ClientError(404, 'Ticket not found');
            ticket.event.ticket_types = ticket.event.ticket_types.filter(ticketType => ticketType._id.toString() === ticketTypeId);
            return ticket;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Ticket not found');
            }
            throw error;
        }
    }

    async getTicketWithEvent(id) {
        try {
            const ticket = await Ticket.findById(id).populate({
                path: 'event_id',
                select: '_id name description image ticket_types status',
                as: 'event'
            });
            if (!ticket) throw new ClientError(404, 'Ticket not found');
            return ticket;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Ticket not found');
            }
            throw error;
        }
    }


    async updateTicketStatus(id, status) {
        try {
            const ticket = await Ticket.findById(id);
            if (!ticket) throw new ClientError(404, 'Ticket not found');
            ticket.status = status;
            await ticket.save();
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Ticket not found');
            }
            throw error;
        }
    }

    async deleteTicket(id) {
        try {
            const ticket = await Ticket.findByIdAndDelete(id);
            if (!ticket) throw new ClientError(404, 'Ticket not found');
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Ticket not found');
            }
            throw error;
        }
    }

    async checkedInTicket(userId, eventId, barcode) {
        try {
            const ticket = await Ticket.findOneAndUpdate({ user_id: userId, event_id: eventId, barcode }, { status: 'checked-in' }, { new: true });
            if (!ticket) throw new ClientError(404, 'Ticket not found');
            return ticket;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Ticket not found');
            }
            throw error;
        }
    }

}

module.exports = new TicketService()
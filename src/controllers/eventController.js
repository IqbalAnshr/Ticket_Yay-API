const { success } = require('../utils/respon');
const eventService = require('../services/eventService');
const transactionService = require('../services/transactionService');
const ticketService = require('../services/ticketService');

class EventController {

    async getEvents(req, res, next) {
        try {
            const events = await eventService.getEvents(req.query);
            success(res, 'Events fetched successfully', 200, events);
        } catch (error) {
            next(error);
        }
    }

    async getEventById(req, res, next) {
        try {
            const event = await eventService.getEventById(req.params.id);
            success(res, 'Event fetched successfully', 200, event);
        } catch (error) {
            next(error);
        }
    }

    async getUserEvents(req, res, next) {
        try {
            const events = await eventService.getUserEvents(req._id, req.query);
            success(res, 'Events fetched successfully', 200, events);
        } catch (error) {
            next(error);
        }
    }

    async getUserEventById(req, res, next) {
        try {
            const event = await eventService.getUserEventById(req._id, req.params.id);
            success(res, 'Event fetched successfully', 200, event);
        } catch (error) {
            next(error);
        }
    }
    async createEvent(req, res, next) {
        try {
            const event = await eventService.createEvent(req._id, req.body);
            success(res, 'Event created successfully', 201, { _id: event._id, name: event.name });
        } catch (error) {
            next(error);
        }
    }

    async updateEvent(req, res, next) {
        try {
            await eventService.updateEvent(req.params.id, req.body);
            success(res, 'Event updated successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async uploadEventImages(req, res, next) {
        try {
            await eventService.uploadEventImages(req.params.id, req.event_images);
            success(res, 'Event images uploaded successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async deleteEventImages(req, res, next) {
        try {
            const event = await eventService.deleteEventImages(req.params.id, req.params.image_name);
            success(res, 'Event images deleted successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async addEventTicketTypes(req, res, next) {
        try {
            const event = await eventService.addEventTicketTypes(req.params.id, req.body);
            success(res, 'Event ticket types added successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async updateEventTicketTypes(req, res, next) {
        try {
            const event = await eventService.updateEventTicketTypes(req.params.id, req.params.ticket_type_id, req.body);
            success(res, 'Event ticket types updated successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    // async deleteEventTicketTypes (req, res, next) {
    //     try {
    //         const event = await eventService.deleteEventTicketTypes(req.params.id, req.params.ticket_type_id);
    //         success(res, 'Event ticket types deleted successfully', 200);
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    async createTicketAndTransactionEvent(req, res, next) {
        // more better use pesimistic concurrency control to avoid race condition and data inconsistency
        // lebih bagus pakai pesimistic concurrency control untuk menghindari race condition dan data inconsistency
        let ticket;
        let transaction;
        try {
            ticket = await ticketService.createTicket(req.params.id, req.params.ticket_type_id, req._id, req.ticketType.price);
            transaction = await transactionService.createTransaction(req._id, req.body, ticket);
            await eventService.incrementSoldTicket(req.params.id, req.params.ticket_type_id);
            success(res, 'Ticket purchased successfully', 200, transaction);
        } catch (error) {
            if (ticket) await ticketService.deleteTicket(ticket._id);
            if (transaction) await transactionService.deleteTransaction(transaction._id);
            next(error);
        }
    }


}

module.exports = new EventController();
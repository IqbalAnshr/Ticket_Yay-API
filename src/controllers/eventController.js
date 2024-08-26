const { success } = require('../utils/respon');
const eventService = require('../services/eventService');

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

    async createEvent(req, res, next) {
        try {
            const event = await eventService.createEvent(req._id, req.body);
            success(res, 'Event created successfully', 201, { _id : event._id , name : event.name });
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

    async addEventTicketTypes (req, res, next) {
        try {
            const event = await eventService.addEventTicketTypes(req.params.id, req.body);
            success(res, 'Event ticket types added successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async updateEventTicketTypes (req, res, next) {
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

}

module.exports = new EventController();
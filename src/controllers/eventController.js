const ClientError = require('../errors/clientError');
const { success } = require('../utils/respon');
const EventService = require('../services/eventService');
const logger = require("../utils/logger");

class EventController {

    async getEvents(req, res, next) {
        try {
            const events = await EventService.getEvents(req.query);
            success(res, 'Events fetched successfully', 200, events);
        } catch (error) {
            next(error);
        }
    }

    async getEventById(req, res, next) {
        try {
            const event = await EventService.getEventById(req.params.id);
            success(res, 'Event fetched successfully', 200, event);
        } catch (error) {
            next(error);
        }
    }

    async createEvent(req, res, next) {
        try {
            await EventService.createEvent(req._id, req.body);
            success(res, 'Event created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async updateEvent(req, res, next) {
        try {
            await EventService.updateEvent(req.params.id, req.body);
            success(res, 'Event updated successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async uploadEventImages(req, res, next) {
        try {
            await EventService.uploadEventImages(req.params.id, req.event_images);
            success(res, 'Event images uploaded successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async deleteEventImages(req, res, next) {
        try {
            const event = await EventService.deleteEventImages(req.params.id, req.params.image_name);
            success(res, 'Event images deleted successfully', 200);
        } catch (error) {
            next(error);
        }
    }


}

module.exports = new EventController();
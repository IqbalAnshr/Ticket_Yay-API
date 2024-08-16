const ClientError = require('../errors/clientError');
const Event = require('../databases/models/event');
const fs = require('fs/promises');
const config = require('../../config/multer');

class EventService {
    async getEvents(query) {
        const { search = '', city = '', page = 1, limit = 15 } = query;
        const offset = (page - 1) * limit;

        const events = await Event.find({
            name: { $regex: search, $options: 'i' },
            'location.city': { $regex: city, $options: 'i' },
        })
            .sort({ created_at: -1 })
            .skip(offset)
            .limit(limit);

        return events;

    }

    async getEventById(id) {
        try {
            const event = await Event.findById(id).populate({
                path: 'organizer',
                select: 'name profile_picture email',
                as: 'organizer'
            });
            return event;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Event not found');
            }
            throw error;
        }
    }

    async createEvent(authId, event) {
        event.organizer = authId;
        event.images = event.event_images;
        const newEvent = new Event(event);
        return newEvent.save();
    }

    async updateEvent(id, event) {
        try {
            await Event.findByIdAndUpdate(id, event);
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Event not found');
            }
            throw error;
        }
    }

    async uploadEventImages(id, images) {
        try {
            await Event.findByIdAndUpdate(id, { $push: { images } });
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Event not found');
            }
            throw error;
        }
    }

    async deleteEventImages(id, images_name) {
        const event = await Event.findById(id);
        if (!event) {
            throw new ClientError(404, 'Event not found');
        }

        const uploadPath = `${config.uploadDirectoryEventImages}/${images_name}`;

        if (!event.images.includes(images_name)) {
            throw new ClientError(404, 'Image not found');
        }

        try {
            await fs.promises.unlink(uploadPath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new ClientError(404, 'Image not found');
            } else {
                throw new Error(`Error deleting image: ${error.message}`);
            }
        }

        event.images = event.images.filter(image => image !== images_name);
        await event.save();
    }
}

module.exports = new EventService();
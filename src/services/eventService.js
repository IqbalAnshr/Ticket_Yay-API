const ClientError = require('../errors/clientError');
const Event = require('../databases/models/event');
const fs = require('fs/promises');
const config = require('../../config/multer');
const redisClient = require('./redisService');

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
            const cachedEvent = await redisClient.get(`event:${id}`);
            if (cachedEvent) {
                return JSON.parse(cachedEvent);
            }
            const event = await Event.findById(id).populate({
                path: 'organizer',
                select: 'name profile_picture email',
                as: 'organizer'
            });
            if (!event) throw new ClientError(404, 'Event not found');
            await redisClient.setEx(`event:${id}`, 3600, JSON.stringify(event));
            return event;
        } catch (error) {
            if (error.name === 'CastError') throw new ClientError(404, 'Event not found');
            throw error;
        }
    }

    async createEvent(authId, event) {
        const { name, description, date, province, city, address, facebook, twitter, instagram, website } = event;
        const newEvent = new Event({
            name,
            description,
            date,
            location: { province, city, address },
            social_media: { facebook, twitter, instagram, website },
            images: null,
            organizer: authId
        });
        return await newEvent.save();
    }

    async updateEvent(id, updatedEvent) {
        try {
            const { name, description, date, province, city, address, facebook, twitter, instagram, website } = updatedEvent;

            let event = await Event.findById(id);
            if (!event) throw new ClientError(404, 'Event not found');

            // Update the event with provided fields, keeping existing data for missing fields
            event.name = name || event.name;
            event.description = description || event.description;
            event.date = date || event.date;

            event.location = {
                province: province || event.location.province,
                city: city || event.location.city,
                address: address || event.location.address
            };

            event.social_media = {
                facebook: facebook || event.social_media.facebook,
                twitter: twitter || event.social_media.twitter,
                instagram: instagram || event.social_media.instagram,
                website: website || event.social_media.website
            };

            await event.save();
            redisClient.del(`event:${id}`);
            return event;
        } catch (error) {
            if (error.name === 'CastError') throw new ClientError(404, 'Event not found');
            throw error;
        }
    }

    async uploadEventImages(id, images) {
        try {
            const event = await Event.findByIdAndUpdate(id, { $push: { images } });
            if (!event) throw new ClientError(404, 'Event not found');
            redisClient.del(`event:${id}`);
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Event not found');
            }
            throw error;
        }
    }

    async deleteEventImages(id, images_name) {
        const event = await Event.findById(id);
        if (!event) throw new ClientError(404, 'Event not found');

        const uploadPath = `${config.uploadDirectoryEventImages}/${images_name}`;

        if (!event.images.includes(images_name)) throw new ClientError(404, 'Image not found');

        try {
            await fs.unlink(uploadPath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new ClientError(404, 'Image not found');
            } else {
                throw new Error(`Error deleting image: ${error.message}`);
            }
        }

        event.images = event.images.filter(image => image !== images_name);
        await event.save();
        redisClient.del(`event:${id}`);
    }

    async addEventTicketTypes(id, ticketTypes) {
        try {
            let event = await Event.findById(id);
            if (!event) throw new ClientError(404, 'Event not found');

            ticketTypes.forEach(ticketType => {
                event.ticket_types.push(ticketType);
            });

            event = await Event.findByIdAndUpdate(id, { $set: { ticket_types: event.ticket_types } });
            redisClient.del(`event:${id}`);
            return event;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Event not found');
            }
            throw error;
        }
    }

    async updateEventTicketTypes(id, ticketTypeId, updatedTicketType) {
        try {
            const { type, price, limit, until, status } = updatedTicketType;
            let event = await Event.findById(id);
            if (!event) throw new ClientError(404, 'Event not found');
            if (!event.ticket_types.some(ticketType => ticketType._id.toString() === ticketTypeId)) {
                throw new ClientError(404, 'Ticket type not found');
            }
            event.ticket_types = event.ticket_types.map(ticketType => {
                if (ticketType._id.toString() === ticketTypeId) {
                    ticketType.type = type || ticketType.type;
                    ticketType.price = price || ticketType.price;
                    ticketType.limit = limit || ticketType.limit;
                    ticketType.until = until || ticketType.until;
                    ticketType.status = status || ticketType.status;
                    return ticketType;
                }
                return ticketType;
            });
            event = await Event.findByIdAndUpdate(id, { $set: { ticket_types: event.ticket_types } });
            redisClient.del(`event:${id}`);
            return event;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Event not found');
            }
            throw error;
        }
    }

    // async deleteEventTicketTypes(id, ticketTypeId) {
    //     try {
    //         const event = await Event.findByIdAndUpdate(id, { $pull: { ticket_types: { _id: ticketTypeId } } });
    //         if (!event.ticket_types.some(ticketType => ticketType._id.toString() === ticketTypeId)) {
    //             throw new ClientError(404, 'Ticket type not found');
    //         }
    //         redisClient.del(`event:${id}`);
    //     } catch (error) {
    //         if (error.name === 'CastError') {
    //             throw new ClientError(404, 'Event not found');
    //         }
    //         throw error;
    //     }
    // }
}

module.exports = new EventService();
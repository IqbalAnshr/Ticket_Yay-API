const ClientError = require('../errors/clientError');
const Event = require('../databases/models/event');
const fs = require('fs/promises');
const config = require('../../config/multer');
const redisClient = require('./redisService');

class EventService {

    #calculatePagination(page, limit, maxPages = 10) {
        const effectivePage = Math.min(page, maxPages);
        const offset = (effectivePage - 1) * limit;
        return offset;
    }

    #createCaseInsensitiveRegex(value) {
        return { $regex: value, $options: 'i' };
    }

    #createPriceRangeFilter(minPrice, maxPrice) {
        const priceFilter = {};
        if (minPrice) priceFilter.$gte = minPrice;
        if (maxPrice) priceFilter.$lte = maxPrice;
        return { $elemMatch: { price: priceFilter } };
    }

    #createDateRangeFilter(month) {
        const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        return { $gte: startOfMonth, $lt: endOfMonth };
    }

    async getEvents(query) {
        const { search = '', city = '', page = 1, limit = 15, minPrice, maxPrice, month } = query;
        const offset = this.#calculatePagination(page, limit);

        const filterQuery = {};
        if (search) filterQuery.name = this.#createCaseInsensitiveRegex(search);
        if (city) filterQuery['location.city'] = this.#createCaseInsensitiveRegex(city);
        if (minPrice || maxPrice) filterQuery.ticket_types = this.#createPriceRangeFilter(minPrice, maxPrice);
        if (month) filterQuery.date = this.#createDateRangeFilter(month);

        const events = await Event.find(filterQuery)
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

    async getUserEvents(authId, query) {
        const { search = '', city = '', page = 1, limit = 15, month } = query;
        const offset = this.#calculatePagination(page, limit);
        try {
            const filterQuery = { organizer: authId };
            if (search) filterQuery.name = this.#createCaseInsensitiveRegex(search);
            if (city) filterQuery['location.city'] = this.#createCaseInsensitiveRegex(city);
            if (month) filterQuery.date = this.#createDateRangeFilter(month);

            const events = await Event.find(filterQuery)
                .sort({ created_at: -1 })
                .skip(offset)
                .limit(limit);

            return events;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Event not found');
            }
            throw error;
        }
    }

    async getUserEventById(authId, eventId) {
        try {
            const event = await Event.findOne({ _id: eventId, organizer: authId });
            if (!event) throw new ClientError(404, 'Event not found');
            return event;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new ClientError(404, 'Event not found');
            }
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
            images: [],
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
        if (!Array.isArray(event.images) || !event.images.includes(images_name)) throw new ClientError(404, 'Image not found');

        const uploadPath = `${config.uploadDirectoryEventImages}/${images_name}`;
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

    async incrementSoldTicket(eventId, ticketTypeId) {
        try {
            const result = await Event.updateOne(
                {
                    _id: eventId,
                    'ticket_types._id': ticketTypeId,
                    $expr: { $lt: ['$ticket_types.sold', '$ticket_types.limit'] }
                },
                {
                    $inc: { 'ticket_types.$.sold': 1 }
                }
            );

            if (result.matchedCount === 0) {
                throw new Error('Failed to increment sold tickets. Either event or ticket type not found, or ticket limit reached.');
            }
        } catch (error) {
            throw new Error(`Could not increment sold tickets: ${error.message}`);
        }
    }


    async decrementSoldTicket(eventId, ticketTypeId) {
        try {
            const result = await Event.updateOne(
                {
                    _id: eventId,
                    'ticket_types._id': ticketTypeId,
                    $expr: { $gt: ['$ticket_types.sold', 0] } // Ensure sold is greater than 0
                },
                {
                    $inc: { 'ticket_types.$.sold': -1 }
                }
            );

            if (result.matchedCount === 0) {
                throw new Error('Failed to decrement sold tickets. Either event or ticket type not found, or ticket sold count is already zero.');
            }
        } catch (error) {
            throw new Error(`Could not decrement sold tickets: ${error.message}`);
        }
    }

}

module.exports = new EventService();
const { success } = require('../utils/respon');
const ticketService = require('../services/ticketService');

class TicketController {

    async getUserTickets(req, res) {
        try {
            const tickets = await ticketService.getUserTickets(req._id, req.query);
            success(res, 'User tickets fetched successfully', 200, tickets);
        } catch (error) {
            throw error;
        }
    }

    async getUserTicketById(req, res) {
        try {
            const ticket = await ticketService.getUserTicketById(req._id, req.params.id);
            success(res, 'User ticket fetched successfully', 200, ticket);
        } catch (error) {
            throw error;
        }
    }

    async checkedInTicket(req, res) {
        try {
            const ticket = await ticketService.checkedInTicket(req._id, req.params.id, req.body.barcode);
            success(res, 'Ticket checked in successfully', 200, ticket);
        } catch (error) {
            throw error;
        }
    }
    
}

module.exports = new TicketController();
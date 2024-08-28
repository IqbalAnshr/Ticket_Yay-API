const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/ticketController');
const TicketMiddleware = require('../../middlewares/ticketMiddleware');
const AuthMiddleware = require('../../middlewares/authMiddleware');

router.get('/', AuthMiddleware.auth, ticketController.getUserTickets);
router.get('/:id', AuthMiddleware.auth, TicketMiddleware.isOwnerTicket, ticketController.getUserTicketById);

module.exports = router
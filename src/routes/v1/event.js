const express = require('express');
const router = express.Router();
const EventController = require('../../controllers/eventController');
const EventMiddleware = require('../../middlewares/eventMiddleware');
const TransactionMiddleware = require('../../middlewares/transactionMiddleware');
const MulterMiddleware = require('../../middlewares/multerMiddleware');
const AuthMiddleware = require('../../middlewares/authMiddleware');
const eventController = require('../../controllers/eventController');
const ticketController = require('../../controllers/ticketController');
const ticketMiddleware = require('../../middlewares/ticketMiddleware');

// route as an owner event that can access
router.get('/o', AuthMiddleware.auth, EventController.getUserEvents);
router.get('/o/:id', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, EventController.getUserEventById);
router.post('/o', AuthMiddleware.auth, EventMiddleware.validateCreateEvent(), EventController.createEvent);
router.put('/o/:id', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, EventMiddleware.validateUpdateEvent(), EventController.updateEvent); // update event
router.post('/o/:id/image', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, MulterMiddleware.uploadEventImagesMiddleware, EventController.uploadEventImages);
router.delete('/o/:id/image/:image_name', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, EventController.deleteEventImages); // delete event
router.post('/o/:id/ticket_type', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, EventMiddleware.validateAddEventTicketType(), EventController.addEventTicketTypes);
router.put('/o/:id/ticket_type/:ticket_type_id', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, EventMiddleware.validateUpdateEventTicketType(), EventController.updateEventTicketTypes);
router.post('/o/:id/checkedin', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, ticketMiddleware.checkTicketIsValid, ticketController.checkedInTicket);

//transaksi ticket event as an buyer
router.get('/', EventController.getEvents);
router.get('/:id', EventController.getEventById);
router.post('/:id/buy_ticket/:ticket_type_id', AuthMiddleware.auth, TransactionMiddleware.validateTransaction(), EventMiddleware.validateTicketType, eventController.createTicketAndTransactionEvent);

// router.delete('/:id/ticket_type/:ticket_type_id', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, EventController.deleteEventTicketTypes);
// router.delete('/:id', AuthMiddleware.auth, EventController.deleteEvent); // delete event
module.exports = router;

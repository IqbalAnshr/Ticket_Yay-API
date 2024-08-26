const express = require('express');
const router = express.Router();
const EventController = require('../../controllers/eventController');
const EventMiddleware = require('../../middlewares/eventMiddleware');
const MulterMiddleware = require('../../middlewares/multerMiddleware');
const AuthMiddleware = require('../../middlewares/authMiddleware');

router.get('/', EventController.getEvents); // get all events
router.get('/:id', EventController.getEventById); // get event by id
router.post('/', AuthMiddleware.auth, EventMiddleware.validateCreateEvent(), EventController.createEvent);
router.put('/:id', AuthMiddleware.auth, EventMiddleware.isOwnerEvent,EventMiddleware.validateUpdateEvent(), EventController.updateEvent); // update event
router.post('/:id/image', AuthMiddleware.auth, EventMiddleware.isOwnerEvent,MulterMiddleware.uploadEventImagesMiddleware, EventController.uploadEventImages);
router.delete('/:id/image/:image_name',AuthMiddleware.auth, EventMiddleware.isOwnerEvent, EventController.deleteEventImages); // delete event
router.post('/:id/ticket_type', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, EventMiddleware.validateAddEventTicketType(),EventController.addEventTicketTypes);
router.put('/:id/ticket_type/:ticket_type_id', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, EventMiddleware.validateUpdateEventTicketType(),EventController.updateEventTicketTypes);
// router.delete('/:id/ticket_type/:ticket_type_id', AuthMiddleware.auth, EventMiddleware.isOwnerEvent, EventController.deleteEventTicketTypes);
// router.delete('/:id', AuthMiddleware.auth, EventController.deleteEvent); // delete event


module.exports = router;

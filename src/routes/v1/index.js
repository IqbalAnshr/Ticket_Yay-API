const express = require('express');
const router = express.Router();

const authRoute = require('./auth');
const userRoute = require('./user');
const eventRoute = require('./event');
const ticketRoute = require('./ticket');
const transactionRoute = require('./transaction');

router.get('/', (req, res) => {
    res.send('v1');
});

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/event', eventRoute);
router.use('/ticket', ticketRoute);
router.use('/transaction', transactionRoute);

module.exports = router;
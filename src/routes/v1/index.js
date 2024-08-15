const express = require('express');
const router = express.Router();

const authRoute = require('./auth');
const userRoute = require('./user');
const eventRoute = require('./event');

router.get('/', (req, res) => {
    res.send('v1');
});

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/event', eventRoute);

module.exports = router;
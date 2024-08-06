const express = require('express');
const router = express.Router();

const authRoute = require('./auth');

router.get('/', (req, res) => {
    res.send('v1');
});

router.use('/auth', authRoute);

module.exports = router;
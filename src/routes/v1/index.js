const express = require('express');
const router = express.Router();

const authRoute = require('./auth');
const userRoute = require('./user');

router.get('/', (req, res) => {
    res.send('v1');
});


router.use('/auth', authRoute);
router.use('/user', userRoute);

module.exports = router;
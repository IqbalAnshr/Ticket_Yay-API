const express = require('express');
const router = express.Router();
const controllerTransaction = require('../../controllers/transactionController');
const transactionMiddleware = require('../../middlewares/transactionMiddleware');
const AuthMiddleware = require('../../middlewares/authMiddleware');

router.get('/', AuthMiddleware.auth, controllerTransaction.getUserTransactions);
router.post('/handlingNotification', transactionMiddleware.verifyMidtransSignature, controllerTransaction.handlingTransactionNotification);

module.exports = router
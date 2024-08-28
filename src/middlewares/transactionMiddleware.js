const { body, validationResult } = require('express-validator');
const ClientError = require('../errors/clientError');
const crypto = require('crypto');
const midstransConfig = require('../../config/midtrans');

class TransactionMiddleware {

    validateTransaction() {
        return [
            body('payment_type')
                .equals('bank_transfer')
                .withMessage('Payment type only support "bank_transfer" at the moment'),
            body('bank_name')
                .isIn(['bca', 'bni', 'bri', 'cimb'])
                .withMessage('Bank name only support "bca", "bni", "bri", or "cimb"'),
            this.handleValidationErrors
        ]
    }

    handleValidationErrors(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(err => err.msg);
            return next(new ClientError(400, errorMessages));
        }
        next();
    }

    async verifyMidtransSignature(req, res, next) {
        try {
            const { order_id, status_code, gross_amount } = req.body;
            const receivedSignatureKey = req.body.signature_key;
            const serverKey = midstransConfig.serverKey;
    
            const dataString = order_id + status_code + gross_amount + serverKey;
    
            const calculatedSignatureKey = crypto.createHash('sha512')
                .update(dataString)
                .digest('hex');
    
            if (calculatedSignatureKey !== receivedSignatureKey) {
                return res.status(400).json({ error: 'Invalid signature key. The notification is not authentic.' });
            }
    
            next();
        } catch (error) {
            return res.status(500).json({ error: 'Failed to verify the signature key.' });
        }
    }

}

module.exports = new TransactionMiddleware();
const { success } = require('../utils/respon');
const transactionService = require('../services/transactionService');

class TransactionController {

    async getUserTransactions(req, res, next) {
        try {
            const transactions = await transactionService.getUserTransactions(req._id, req.query);
            success(res, 'User transactions fetched successfully', 200, transactions);
        } catch (error) {
            next(error);
        }
    }

    async handlingTransactionNotification(req, res, next) {
        try {
            await transactionService.handleTransactionNotification(req.body);
            success(res, 'Transaction notification handled successfully', 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TransactionController()
const Transaction = require('../databases/models/transaction');
const mongoose = require('mongoose');
const midtransRequestorService = require('./midtransRequestorService');
const eventService = require('./eventService');
const ticketService = require('./ticketService');
const { getThirtyDaysBeforeToday } = require('../utils/date');

class TransactionService {


    #buildFilter(userId, { from = getThirtyDaysBeforeToday(), to = new Date(), status }) {
        const filter = { user_id: userId };

        if (status && status !== 'all') {
            filter['payment_details.transaction_status'] = status;
        }

        if (from || to) {
            filter.created_at = {};
            if (from) filter.created_at.$gte = new Date(from);
            if (to) filter.created_at.$lte = new Date(to);
        }

        return filter;
    }

    #formatTransaction(transaction) {
        const event = transaction.ticket_id.event_id;
        const ticketType = event.ticket_types.find(t =>
            t._id.toString() === transaction.ticket_id.ticket_type_id.toString()
        );

        return {
            _id: transaction._id,
            event_name: event.name,
            ticket_type: ticketType?.type || 'Unknown',
            created_at: transaction.created_at,
            payment_details: transaction.payment_details,
        };
    }

    async getUserTransactions(userId, query) {
        try {
            const filter = this.#buildFilter(userId, query);
            const transactions = await Transaction.find(filter).populate({
                path: 'ticket_id',
                select: 'event_id ticket_type_id',
                populate: {
                    path: 'event_id',
                    select: 'name ticket_types'
                }
            }).sort({ created_at: -1 });

            return transactions.map(this.#formatTransaction);
        } catch (error) {
            throw new Error(`Error fetching user transactions: ${error.message}`);
        }
    }

    async getTransactionById(id) {
        try {
            return await Transaction.findOne({ _id: id }).populate('ticket_id');
        } catch (error) {
            throw new Error(`Error fetching transaction by ID: ${error.message}`);
        }
    }

    async createTransaction(userId, body, ticket) {
        let transaction;
        try {
            transaction = new Transaction({
                _id: new mongoose.Types.ObjectId(),
                user_id: userId,
                ticket_id: ticket._id,
            });

            await transaction.save();

            const response = await midtransRequestorService.chargeBankTransfer(
                body.bank_name,
                ticket.price,
                transaction._id
            );

            transaction.payment_details = response;
            await transaction.save();
            return transaction;
        } catch (error) {
            if (transaction) await this.deleteTransaction(transaction._id);
            throw new Error(`Error creating transaction: ${error.message}`);
        }
    }

    async handleTransactionNotification(body) {
        try {
            const transaction = await this.getTransactionById(body.order_id);

            if (transaction) {
                transaction.payment_details = body;
                transaction.status = body.transaction_status;
                await transaction.save();

                await this.#handleTicketStatusUpdate(transaction);

                return transaction;
            }
        } catch (error) {
            throw new Error(`Error handling transaction notification: ${error.message}`);
        }
    }

    async #handleTicketStatusUpdate(transaction) {
        const { status } = transaction;

        if (['settlement', 'capture'].includes(status)) {
            await ticketService.updateTicketStatus(transaction.ticket_id, 'purchased');
        } else if (!['settlement', 'pending', 'capture'].includes(status)) {
            await eventService.decrementSoldTicket(
                transaction.ticket_id.event_id,
                transaction.ticket_id.ticket_type_id
            );
            await ticketService.updateTicketStatus(transaction.ticket_id, 'cancelled');
        }

        await transaction.save();
    }

    async deleteTransaction(transactionId) {
        try {
            await Transaction.deleteOne({ _id: transactionId });
        } catch (error) {
            throw new Error(`Error deleting transaction: ${error.message}`);
        }
    }
}

module.exports = new TransactionService();

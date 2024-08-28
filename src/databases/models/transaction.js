const { Schema, model } = require('mongoose');

const TransactionSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ticket_id: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    payment_details: { type: Schema.Types.Mixed },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = model('Transaction', TransactionSchema);
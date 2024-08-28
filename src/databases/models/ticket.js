const { Schema, model } = require('mongoose');

const TicketSchema = new Schema({
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'Users', default: null },
    ticket_type_id: { type: Schema.Types.ObjectId, required: true },
    barcode: { type: String, required: true, unique: true },
    status: { type: String, required: true }, //"pending", "purchased", "expired", "cancelled","checked-in"
    price: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
});

module.exports = model('Ticket', TicketSchema);
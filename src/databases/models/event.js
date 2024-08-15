const { Schema, model } = require('mongoose');

const SocialMediaSchema = new Schema({
    facebook: String,
    twitter: String,
    instagram: String,
    website: String
}, { _id: false });

const TicketTypeSchema = new Schema({
    type: { type: String, required: true }, // "regular", "flash_sale", "early_bird"
    price: { type: Number, required: true },
    limit: { type: Number, required: true }, // Batas maksimum tiket untuk tipe ini
    sold: { type: Number, default: 0 }, // Jumlah tiket yang terjual untuk tipe ini
    until: { type: Date, required: true }, // Batas akhir pemesanan
    status: { type: String, required: true }, // "active", "sold_out"
});

const locationSchema = new Schema({
    province: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true }
}, { _id: false });

const EventSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: locationSchema,
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ticket_types: [TicketTypeSchema],
    social_media: SocialMediaSchema,
    images: [{ type: String }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = model('Event', EventSchema);

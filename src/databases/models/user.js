const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: {
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    phone_number: {
        type: String
    },
    birthdate: {
        type: Date
    },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female'],
        },
    },
    password: {
        type: String,
        required: true
    },
    profile_picture: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});


module.exports = model('User', userSchema)
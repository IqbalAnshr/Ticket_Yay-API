require('dotenv').config();

const baseUrl = process.env.NODE_ENV === 'production' ? 'https://api.midtrans.com/v2' : 'https://api.sandbox.midtrans.com/v2'

module.exports = {
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
    baseUrl
}
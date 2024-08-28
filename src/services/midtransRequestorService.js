const axios = require('axios');
const midtransConfig = require('../../config/midtrans');
const DateFormatter = require('../utils/date');

class MidtransRequestorService {
    constructor() {
        this.baseURL = midtransConfig.baseUrl;
        this.serverKey = Buffer.from(`${midtransConfig.serverKey}:`).toString('base64');
    }

    async request(method, endpoint, data = {}) {
        try {
            const response = await axios({
                method,
                url: `${this.baseURL}${endpoint}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Basic ${this.serverKey}`
                },
                data: method === 'post' ? JSON.stringify(data) : undefined
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async chargeBankTransfer(bank, grossAmount, orderId) {
        const data = this.#buildBankTransferPayload(bank, grossAmount, orderId);
        return await this.request('post', '/charge', data);
    }

    #buildBankTransferPayload(bank, grossAmount, orderId) {
        return {
            payment_type: 'bank_transfer',
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount
            },
            bank_transfer: {
                bank: bank
            },
            custom_expiry: {
                "order_time": DateFormatter.getFormattedDateWIB(),
                "expiry_duration": 15,
                "unit": "minute"
            }
        };
    }
}

module.exports = new MidtransRequestorService();
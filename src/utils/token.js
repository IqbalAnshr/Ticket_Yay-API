const jsonwebtoken = require('jsonwebtoken');

module.exports = {
    sign: (payload, secret, expired) => {
        return jsonwebtoken.sign(payload, secret, expired);
    },
    verify: (token, secret) => {
        return jsonwebtoken.verify(token, secret);
    },
    decode: (token) => {
        return jsonwebtoken.decode(token);
    }
}
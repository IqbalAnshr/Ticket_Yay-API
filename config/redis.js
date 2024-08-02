require('dotenv').config();

module.exports = {
    uri : process.env.REDIS_URI || 'redis://redis:6379'
}
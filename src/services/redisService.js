const redis = require('redis');
const redisConfig = require('../../config/redis'); 
const logger = require('../utils/logger'); 

// Create and configure the Redis client
const redisClient = redis.createClient({ url: redisConfig.uri });

redisClient.connect();

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

module.exports = redisClient;

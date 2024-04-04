// redisClient.js - wrapper around redis
const redis = require('redis');
const logger = require('./logger').getLogger(module);

class RedisClient {
  constructor() {
    if (!RedisClient.instance) {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
      });
      this.isConnected = false;
      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Connected to Redis');
      });
      this.client.on('end', () => this.isConnected = false);
      this.client.on('error', (err) => logger.error('Redis Client Error', err));
      RedisClient.instance = this;
    }
    return RedisClient.instance;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RedisClient();
    }
    return this.instance;
  }

  async connect() {
    if (this.isConnected) {
      logger.info('Already connected to Redis, skipping new connection.');
      return;
    }
    try {
      await this.client.connect();
      this.isConnected = true;
      this.client.on('error', (err) => {
        logger.error('Redis error', err);
        this.isConnected = false;
      });
    } catch (err) {
      if (err.message.includes('Socket already opened')) {
        this.isConnected = true; // Assuming the connection is open if this error occurs
        logger.info('Redis connection is already established.');
      } else {
        logger.error('Redis Client Connection Error', err);
        throw err; // Re-throw other errors - will need to be handled elsewhere
      }
    }
  }

  async rpush(key, value) {
    return await this.client.RPUSH(key, value);
  }

  async zadd(key, score, value) {
    try {
      return await this.client.zadd(key, score, value);
    } catch (error) {
      logger.error('Redis zadd Error', error);
      throw error;
    }
  }

  async zremrangebyscore(key, min, max) {
    try {
      return await this.client.zremrangebyscore(key, min, max);
    } catch (error) {
      logger.error('Redis zremrangebyscore Error', error);
      throw error;
    }
  }

  // Async scan method
  /**
     * Asynchronously scans the keyspace
     * @param {string} matchPattern The pattern to match keys against
     * @param {number} count The approximate number of keys to return in each call
     * @returns {Promise<Array>} A promise that resolves to an array of keys
     */
  async scan(matchPattern = '*', count = 100) {
    let cursor = '0';
    const keys = [];

    do {
      try {
        const scanResult = await this.client.scan(cursor, 'MATCH', matchPattern, 'COUNT', count);
        cursor = scanResult[0];
        keys.push(...scanResult[1]);
      } catch (error) {
        logger.error('Redis scan Error', error);
        throw error; // Propagate the error to be handled by the caller
      }
    } while (cursor !== '0');

    return keys;
  }

  async disconnect() {
    try {
      await this.client.quit();
      // eslint-disable-next-line max-len
      this.isConnected = false; // Update the connection state to false after successful disconnection
      logger.info('Disconnected from Redis successfully.');
    } catch (error) {
      logger.error('Redis disconnect Error', error);
      throw error;
    }
  }

  async shutDown() {
    // Check if the client is already connected
    if (this.isConnected) {
      logger.info('Shutting down Redis client');
      try {
        // Gracefully close the Redis connection
        await this.client.quit();
        this.isConnected = false; // Update the connection state
        logger.info('Redis client closed');
      } catch (err) {
        // Log any errors encountered during shutdown
        logger.error('Error closing Redis client', err);
      }
    } else {
      // If not connected, no shutdown required
      logger.info('Redis client is not connected. No need to shut down.');
    }
  }
}

module.exports = RedisClient.getInstance();

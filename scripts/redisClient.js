// redisClient.js - wrapper around redis
require('dotenv').config();
const logger = require('./logger.js');
const redis = require('redis');

class RedisClient {
    constructor() {
        if (!RedisClient.instance) {
            this.client = redis.createClient({
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: process.env.REDIS_PORT || 6379
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
        } catch (err) {
            if (err.message.includes('Socket already opened')) {
                //TODO: need a better way of handling this
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
    async scan(cursor, matchPattern = "*", count = 10) {
        try {
            const args = [cursor];
            if (matchPattern) {
                args.push('MATCH', matchPattern);
            }
            if (count && !isNaN(count)) {
                args.push('COUNT', count);
            }
            return await this.client.scan(...args);
        } catch (error) {
            logger.error('Redis scan Error', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.quit();
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

const instance = RedisClient.getInstance();

module.exports = instance;
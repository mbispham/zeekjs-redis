// redisClient.js - wrapper around redis
require('dotenv').config();
const logger = require('./logger.js');
const redis = require('redis');

class RedisClient {
    constructor() {
        this.client = redis.createClient({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379
        });
        this.isConnected = false;
        this.client.on('connect', () => this.isConnected = true);
        this.client.on('end', () => this.isConnected = false);
        this.client.on('error', (err) => logger.error('Redis Client Error', err));
    }

    async connect() {
        if (!this.isConnected) {
            try {
                await this.client.connect();
            } catch (err) {
                logger.error('Redis Client Connection Error', err);
                throw err;
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
            console.log('Disconnected from Redis successfully.');
        } catch (error) {
            logger.error('Redis disconnect Error', error);
            throw error;
        }
    }

    async shutDown() {
        if (this.isConnected) {
            logger.info('Shutting down Redis client');
            try {
                await this.client.quit();
                this.isConnected = false;
                logger.info('Redis client closed');
            } catch (err) {
                logger.error('Error closing Redis client', err);
            }
        } else {
            logger.info('Redis client is not connected. No need to shut down.');
        }
    }
}

const redisClient = new RedisClient();
module.exports = redisClient;
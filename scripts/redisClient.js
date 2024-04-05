// redisClient.js - wrapper around redis
const redis = require('redis');
const logger = require('./logger').getLogger(module);
const { redisHost, redisPort } = require('./config');

class RedisClient {
  constructor() {
    // Using JS not typescript so port and host are not strongly typed
    this.client = redis.createClient({
      port: redisPort,
      host: redisHost,
    });
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 10; // Max number of reconnection attempts
    this.setupListeners();
  }

  // Setting up connection event listeners
  setupListeners() {
    this.client.on('connect', () => {
      this.isConnected = true;
      // logger.info('Connected to Redis');
    });
    // eslint-disable-next-line no-return-assign
    this.client.on('end', () => this.isConnected = false);
    this.client.on('error', async (err) => {
      this.isConnected = false;
      if (err.code === 'ECONNREFUSED') {
        // eslint-disable-next-line no-plusplus
        this.connectionAttempts++;
        if (this.connectionAttempts <= this.maxConnectionAttempts) {
          logger.error(`Attempt ${this.connectionAttempts} failed. Check Redis server availability and network connections. Retrying...`);
          await this.retryConnection();
        } else {
          logger.error('All connection attempts failed. Stopping further attempts.');
        }
      } else {
        logger.error('Redis Client Error', err);
      }
    });
  }

  async retryConnection() {
    try {
      await this.client.connect();
      this.connectionAttempts = 0; // Reset attempts after successful connection
      this.isConnected = true;
      logger.info('Connected to Redis');
    } catch (err) {
      logger.error(`Redis Client Connection Error: ${err.message}`);
      // The error handling for retry attempts is already in the 'error' event listener
    }
  }

  async connect() {
    if (this.isConnected || this.connectionAttempts > this.maxConnectionAttempts) {
      if (this.connectionAttempts > this.maxConnectionAttempts) {
        logger.info('Maximum connection attempts reached. Not attempting further connections.');
      } else {
        logger.info('Already connected to Redis, skipping new connection.');
      }
      return;
    }

    try {
      await this.client.connect();
      this.isConnected = true;
      this.connectionAttempts = 0; // Reset attempts after successful connection
    } catch (err) {
      try {
        await this.client.connect();
      } catch (error) {
        if (error.message.includes('Socket already opened')) {
          logger.info(`${redisHost}:${redisPort} is already open and will be re-used to attempt redis connection.`);
          this.isConnected = true;
        } else {
          logger.error(`Redis Client Connection Error : ${error.message}`);
          logger.error(`Error Stack: ${error.stack}`);
          if (error.code) {
            logger.error(`Error Code: ${error.code}`);
          }
          if (error.syscall) {
            logger.error(`System Call: ${error.syscall}`);
          }
          if (error.address && error.port) {
            logger.error(`Address: ${error.address}, Port: ${error.port}`);
          }
          throw error;
        }
      }
    }
  }

  async rpush(key, value) {
    return this.client.RPUSH(key, value);
  }
}

module.exports = new RedisClient();

// index.js
const logger = require('./logger').getLogger(module);
const redisClient = require('./redisClient');
const {
  redisHost, redisPort, socketHost, socketPort,
} = require('./config');
const { createServer } = require('./socketServer');

async function main() {
  try {
    logger.info(`Attempting to connect to redis on ${redisHost}:${redisPort}`);
    logger.info(`Attempting to create local socket on ${socketHost}:${socketPort}`);
    await redisClient.connect();
    createServer().listen(socketPort);
  } catch (err) {
    logger.error(`Initialization error: ${err.message}`);
    logger.error(`Error Stack: ${err.stack}`);
    if (err.code) {
      logger.error(`Error Code: ${err.code}`);
    }
    if (err.syscall) {
      logger.error(`System Call: ${err.syscall}`);
    }
    if (err.address && err.port) {
      logger.error(`Address: ${err.address}, Port: ${err.port}`);
      process.exit(1);
    }
  }
}

function shutDown() {
  logger.info('Shutting down gracefully');
  redisClient.quit();
  process.exit(0);
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

main()
  .then(() => {
    logger.info('Local socket established; connected to Redis');
  })
  .catch((err) => {
    logger.error('Initialization failed:', err);
    process.exit(1);
  });

// index.js
const net = require('net');
const redis = require('redis'); //
const logger = require('./logger.js');
const redisClient = require('./redisClient');
const { createServer } = require('./socketServer');

const server = createServer();

async function main() {
    try {
        await redisClient.connect();
        const port = 3000;
        logger.info('Starting server on port: ' + port);
    } catch (err) {
        logger.error('Initialization error:', err);
        if (err.message.includes("Socket already opened")) {
            // Handle the specific case where the socket is already opened
            logger.info('Continuing with the existing Redis connection.');
        } else {
            // If the error is not about an already open connection, exit the process
            process.exit(1);
        }
    }
}

function shutDown() {
    logger.info('Shutting down gracefully');
    // Perform any necessary cleanup
    redisClient.quit();
    process.exit(0);
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

const { processAndSendLog } = require('./ZeekRedis.js');

function convertDataToLogRecord(data) {
    return JSON.parse(data);
}

main()
    .then(() => {
        logger.info('Initialization successful');
    })
    .catch((err) => {
        logger.error('Initialization failed:', err);
        process.exit(1);
    });
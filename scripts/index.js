// index.js
const net = require('net');
const logger = require('./logger.js');

const redisClient = require('./redisClient');

async function main() {
    try {
        await redisClient.connect();
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

    // Setup shutdown hooks
    process.on('SIGTERM', () => redisClient.shutDown());
    process.on('SIGINT', () => redisClient.shutDown());
}

const { processAndSendLog } = require('./ZeekRedis.js');

const server = net.createServer(socket => {
    logger.info('Client connected');

    socket.on('data', async (data) => {
        try {
            const logRecord = convertDataToLogRecord(data);
            await processAndSendLog(logRecord, 'DerivedLogId');
        } catch (err) {
            logger.error('Error processing data:', err);
        }
    });

    socket.on('end', () => {
        logger.info('Client disconnected');
    });
});

server.listen(3000, () => {
    logger.info('Socket server listening on port 3000');
});

function convertDataToLogRecord(data) {
    return JSON.parse(data);
}

function shutDown() {
    logger.info('Received kill signal, shutting down gracefully');
    server.close(() => {
        logger.info('Closed out remaining connections');
        process.exit(0);
    });

    // Force close any remaining connections after a timeout
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

main()
    .then(() => {
        logger.info('Initialization successful');
    })
    .catch((err) => {
        logger.error('Initialization failed:', err);
        process.exit(1);
    });
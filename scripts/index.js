// index.js
const net = require('net');
const redis = require('redis'); //
const logger = require('./logger.js');

const redisClient = require('./redisClient');

// Function to check if a port is available
function checkPort(port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.close(() => resolve(true));
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false); // Port is in use
            } else {
                reject(err); // Other error
            }
        });
    });
}

// Function to check if Redis is running on a given port
async function isRedisRunningOnPort(port) {
    return new Promise((resolve) => {
        const client = redis.createClient({ port });
        client.on('ready', () => {
            client.quit();
            resolve(true); // Redis is running
        });
        client.on('error', () => {
            client.quit();
            resolve(false); // Redis is not running
        });
    });
}

// Function to find an available port, starting from a given port
async function findAvailablePort(startingPort) {
    let currentPort = startingPort;
    while (true) {
        const isAvailable = await checkPort(currentPort);
        if (isAvailable) {
            const isRedis = await isRedisRunningOnPort(currentPort);
            if (isRedis) {
                return currentPort; // Redis is running on this port
            }
        }
        currentPort += 1;
    }
}

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

// shutDown function
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

async function main() {
    try {
        await redisClient.connect();
        const port = await findAvailablePort(3000);
        logger.info('Starting server on port: ' + port);
        server.listen(port, () => {
            logger.info(`Socket server listening on port ${port}`);
        });
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
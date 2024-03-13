//ZeekRedis.js
'use strict';
const logger = require('./logger.js');
const fs = require('fs').promises;
const redisClient = require('./redisClient.js');

// Overriding BigInt serialization for JSON
BigInt.prototype.toJSON = function() {
    return this.toString();
}

// Async function to process and send logs to Redis
async function processAndSendLog(rec, log_id) {
    if (log_id.includes('::')) {
        [log_id] = log_id.split('::');
    }
    log_id = log_id.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()

    // Check id of the log e.g.: conn, http, ssl etc
    const logFile = `${log_id}.log`;
    const redisKey = `zeek_${log_id}_logs`;
    const log_rec = zeek.select_fields(rec, zeek.ATTR_LOG);
    const flat_rec = zeek.flatten(log_rec);

    try {
        await fs.appendFile(logFile, JSON.stringify(flat_rec) + '\n');
        await redisClient.rpush(redisKey, JSON.stringify(flat_rec));
    } catch (err) {
        logger.error('Error writing to file or Redis:', err);
    }
}

// Connect to Redis
redisClient.connect()
    .then(() => {
        logger.info('Connected to Redis');
        // Integration with Zeek
        zeek.hook('Log::log_stream_policy', {priority: -1000}, (rec, log_id) => {
            processAndSendLog(rec, log_id).catch(err => logger.error(err));
        });
    })
    .catch(err => {
        logger.error('Failed to connect to Redis:', err);
        process.exit(1);
    });

// Graceful Shutdown
function shutDown() {
    logger.info('Shutting down, ensuring all logs are processed');
    // Ensure all ongoing log processing to complete

    logger.info('Closing Redis connection');
    redisClient.quit().then(() => {
        logger.info('Redis client closed');
        process.exit(0);
    });
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

module.exports = { redisClient, processAndSendLog };
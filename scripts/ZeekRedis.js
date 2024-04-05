// ZeekRedis.js
const fs = require('fs').promises;
const stringify = require('safe-stable-stringify').configure({
  deterministic: false,
});
const logger = require('./logger').getLogger(module);
const redisClient = require('./redisClient');

// Overriding BigInt serialization for JSON
// eslint-disable-next-line no-extend-native,func-names
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Async function to process and send logs to Redis
// zeekjs docs shout out - https://zeekjs.readthedocs.io/en/latest/index.html#taking-over-logging
async function processAndSendLog(logData, logID) {
  if (logID.includes('::')) {
    // eslint-disable-next-line no-param-reassign
    [logID] = logID.split('::');
  }
  // eslint-disable-next-line no-param-reassign
  logID = logID.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

  // Check id of the log e.g.: conn, http, ssl etc
  const logFile = `${logID}.log`;
  const redisKey = `zeek_${logID}_logs`;
  const logRec = zeek.select_fields(logData, zeek.ATTR_LOG);
  // const flat_rec = zeek.flatten(log_rec);
  const serializedData = stringify(logRec);

  try {
    await fs.appendFile(logFile, `${serializedData}\n`);
    await redisClient.rpush(redisKey, serializedData);
  } catch (err) {
    logger.error('Error writing to file or Redis:', err);
  }
}

// Connect to Redis
redisClient.connect()
  .then(() => {
    // Integration with Zeek
    zeek.hook('Log::log_stream_policy', { priority: -1000 }, (logData, logID) => {
      processAndSendLog(logData, logID).catch((err) => logger.error(err));
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to Redis:', err);
    process.exit(1);
  });

// Graceful Shutdown
function shutDown() {
  logger.info('Shutting down, ensuring all logs are processed');
  redisClient.shutDown()
    .then(() => {
      logger.info('Redis client closed');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Error during Redis client shutdown:', err);
      process.exit(1);
    });
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

module.exports = { redisClient, processAndSendLog };

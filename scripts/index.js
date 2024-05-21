/// index.js - This is still WIP
const redis = require('redis');
const fs = require('fs').promises;
const stringify = require('safe-stable-stringify').configure({
  deterministic: false,
});
const logger = require('./logger').getLogger(module);

// Unix socket filepath
const { ZEEKJS_REDIS_SOCKET_PATH } = require('./config');

// Overriding BigInt serialization for JSON
// eslint-disable-next-line no-extend-native,func-names
BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function initializeRedis() {
  const client = redis.createClient({
    socket: {
      path: ZEEKJS_REDIS_SOCKET_PATH,
    },
  });

  client.on('error', (err) => {
    logger.error('Redis client error', err);
  });

  try {
    await client.connect();
    logger.info('Connected to Redis successfully.');
    return client;
  } catch (err) {
    logger.error('Failed to connect to Redis:', err);
    throw err;
  }
}

// Async function to process and send logs to Redis
// zeekjs docs shout out - https://zeekjs.readthedocs.io/en/latest/index.html#taking-over-logging
async function processAndSendLog(client, logData, logID) {
  if (!client) {
    throw new Error('Redis client not connected');
  }
  if (logID.includes('::')) {
    // eslint-disable-next-line no-param-reassign
    [logID] = logID.split('::');
  }
  // eslint-disable-next-line no-param-reassign
  logID = logID.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

  const logFile = `${logID}.log`;
  const redisKey = `zeek_${logID}_logs`;
  const logRec = zeek.select_fields(logData, zeek.ATTR_LOG);
  const serializedData = stringify(logRec);

  try {
    fs.appendFile(logFile, `${serializedData}\n`);
  } catch (err) {
    console.error('Error writing to logfile:', err);
  }

  try {
    client.rPush(redisKey, serializedData);
  } catch (err) {
    console.error('Error writing to redis:', err);
  }
}

async function main() {
  let client;
  try {
    client = await initializeRedis();
    logger.info('Connected to Redis through Unix socket.');
    zeek.hook('Log::log_stream_policy', { priority: -1000 }, (logData, logID) => {
      processAndSendLog(client, logData, logID).catch((err) => {
        logger.error('Failed to process and send log:', err);
      });
    });
    logger.info('Log stream policy hook setup successfully.');
  } catch (error) {
    logger.error('Error in connecting to Redis:', error);
    // Exit the function to prevent further execution
  }
}
main()
  .then(() => {
    console.log('Main function completed successfully.');
  })
  .catch((error) => {
    console.error('Error occurred:', error);
  });

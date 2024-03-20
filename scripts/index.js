/// index.js
const redis = require('redis');
const fs = require('fs').promises;
const stringify = require('safe-stable-stringify').configure({
  deterministic: false,
});
const logger = require('./logger').getLogger(module);

// Connect to redis
// Send Zeek logs

// Specify the path to the Unix socket file
const { ZEEKJS_REDIS_SOCKET_PATH } = require('./config');

// Overriding BigInt serialization for JSON
// eslint-disable-next-line no-extend-native,func-names
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const client = redis.createClient({
  socket: {
    path: ZEEKJS_REDIS_SOCKET_PATH,
  },
});

client.connect();

// Continue with your Redis operations
client.on('connect', () => {
  logger.info('Connected to Redis through Unix socket.');
});

client.on('error', (err) => {
  logger.error('Redis client error', err);
});

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
    await redis.rpush(redisKey, serializedData);
  } catch (err) {
    logger.error('Error writing to file or Redis:', err);
  }
}

// Call the function to process and send data
processAndSendLog().then(() => {
  logger.info('Data processing and sending completed.');
}).catch((error) => {
  logger.error('Error in processing and sending data:', error);
});

module.exports = { client, processAndSendLog };

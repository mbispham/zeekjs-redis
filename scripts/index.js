/// index.js - This is still WIP
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

async function initializeRedis() {
  const client = redis.createClient({
    socket: {
      path: ZEEKJS_REDIS_SOCKET_PATH,
    },
  });

  client.on('error', (err) => {
    logger.error('Redis client error', err);
  });

  await client.connect();
  return client;
}

// Async function to process and send logs to Redis
// zeekjs docs shout out - https://zeekjs.readthedocs.io/en/latest/index.html#taking-over-logging
async function processAndSendLog(client) {
  if (!client) {
    throw new Error('Redis client not connected');
  }

  // TODO: test whether zeek hook is correctly handling asynchronous operations???
  zeek.hook('Log::log_stream_policy', async (logData, logID) => {
    try {
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

      await fs.appendFile(logFile, `${serializedData}\n`);
      await client.rpush(redisKey, serializedData);
    } catch (err) {
      logger.error('Error writing to file or Redis:', err);
    }
  });
}

async function main() {
  let client;
  try {
    client = await initializeRedis();
    logger.info('Connected to Redis through Unix socket.');
    await processAndSendLog(client);
    logger.info('Data processing and sending completed.');
  } catch (error) {
    logger.error('Error in processing and sending data:', error);
  } finally {
    if (client) {
      client.quit();
    }
  }
}

main();

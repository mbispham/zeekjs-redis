require('dotenv').config({ path: './scripts/.env' });

module.exports = {
  ZEEKJS_REDIS_NODE_ENV: process.env.ZEEKJS_REDIS_NODE_ENV || 'development',
  ZEEKJS_REDIS_FILE_LOG_LEVEL: process.env.ZEEKJS_REDIS_FILE_LOG_LEVEL || 'info',
  ZEEKJS_REDIS_SOCKET_PATH: process.env.ZEEKJS_REDIS_SOCKET_PATH || '/var/run/redis/redis.sock',
  ZEEKJS_REDIS_CONF_PATH: process.env.ZEEKJS_REDIS_CONF_PATH || '/etc/redis/redis.conf',
};

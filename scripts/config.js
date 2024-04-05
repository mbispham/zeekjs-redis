require('dotenv').config({ path: './scripts/.env' });

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  fileLogLevel: process.env.FILE_LOG_LEVEL || 'info',
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: parseInt(process.env.REDIS_PORT, 10) || 6379,
  redisPassword: process.env.REDIS_PASSWORD || '',
  redisCertPath: process.env.REDIS_CERT_PATH || '/etc/redis/ssl',
  redisConfPath: process.env.REDIS_CONF_PATH || '/etc/redis/redis.conf',
  daysValid: parseInt(process.env.DAYS_VALID, 10) || 365,
  socketHost: process.env.SOCKET_HOST || '127.0.0.1',
  socketPort: parseInt(process.env.SOCKET_PORT, 10) || 3000,
};

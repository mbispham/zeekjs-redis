// logger.js
const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

const fileTransport = new winston.transports.DailyRotateFile({
  filename: 'zeekjs-redis-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: process.env.FILE_LOG_LEVEL || 'info',
});

fileTransport.on('error', (err) => {
  console.error('Error in file transport of logger:', err);
});

const consoleTransport = new winston.transports.Console({
  level: process.env.CONSOLE_LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [fileTransport],
  exceptionHandlers: [fileTransport, consoleTransport],
  rejectionHandlers: [fileTransport, consoleTransport],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(consoleTransport);
}

function setLogLevel(level, transport = 'all') {
  if (transport === 'file') {
    fileTransport.level = level;
  } else if (transport === 'console') {
    consoleTransport.level = level;
  } else {
    logger.level = level;
  }
}

function getLogger(module) {
  return {
    log: (level, message) => {
      logger.log({
        label: path.basename(module.filename),
        level,
        message,
      });
    },
    info: (message) => {
      logger.log({
        level: 'info',
        message,
        label: path.basename(module.filename),
      });
    },
    warn: (message) => {
      logger.log({
        level: 'warn',
        message,
        label: path.basename(module.filename),
      });
    },
    error: (message) => {
      logger.log({
        level: 'error',
        message,
        label: path.basename(module.filename),
      });
    },
  };
}

module.exports = logger;
module.exports.setLogLevel = setLogLevel;
module.exports.getLogger = getLogger;

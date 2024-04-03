//logger.js
const winston = require('winston');
require('winston-daily-rotate-file');

const fileTransport = new winston.transports.DailyRotateFile({
    filename: 'zeekjs-redis-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info'
});

// Configure the Winston logger.
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',  // Set the default logging level
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        fileTransport,
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// When not in production, log to the console.
if (process.env.NODE_ENV !== 'production') {
    logger.transports = [
        fileTransport,
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ];
} else {
    // In production, just use the file transport.
    logger.transports = [fileTransport];
}


function setLogLevel(level) {
    logger.level = level;
}

module.exports = logger;
module.exports.setLogLevel = setLogLevel;
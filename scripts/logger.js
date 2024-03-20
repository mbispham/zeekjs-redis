// logger.js
const winston = require('winston');

// Configure the Winston logger.
const logger = winston.createLogger({
    level: 'info',  // Set the default logging level
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // File transports
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'zeekjs-redis.log' })
    ]
});

// When not in production log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;

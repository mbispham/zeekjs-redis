// socketServer.js
const net = require('net');
const { processAndSendLog } = require('./ZeekRedis');
const logger = require('./logger').getLogger(module);
const { socketHost, socketPort } = require('./config');

function createServer() {
  const server = net.createServer((socket) => {
    logger.info('Client connected');

    socket.on('data', async (data) => {
      try {
        logger.info('Received data:', data.toString());
        // Assuming the incoming data is a JSON string containing both the log and its ID
        const parsedData = JSON.parse(data.toString());
        const logData = parsedData.log; // log data var
        const { logId } = parsedData; // log ID var

        if (logData && logId) {
          await processAndSendLog(logData, logId);
        } else {
          logger.error('Invalid data format received: Missing log data or log ID');
        }
      } catch (err) {
        logger.error('Error processing data:', err);
      }
    });

    socket.on('end', () => {
      logger.info('Client disconnected');
    });

    socket.on('error', (err) => {
      logger.error('Socket error:', err);
    });
  });

  server.listen(socketHost, socketPort);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // If the error code is EADDRINUSE, suppress the error
      // logger.info(`Port ${socketPort} is already in use. Suppressing error.`);
      // Could try implementing a different port if this occurs
    } else {
      logger.error(`Server error: ${err.message}`);
      logger.error(`Error Stack: ${err.stack}`);
    }
  });
  return server;
}

module.exports = { createServer };

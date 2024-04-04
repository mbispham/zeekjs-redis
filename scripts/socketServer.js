// socketServer.js
const net = require('net');
const { processAndSendLog } = require('./ZeekRedis');
const logger = require('./logger').getLogger(module);

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

  const host = process.env.HOST || '127.0.0.1';
  const port = parseInt(process.env.PORT, 10) || 3000;

  server.listen(port, host, () => {
    logger.info(`Server listening on ${host}:${port}`);
  });

  server.on('error', (err) => {
    logger.error('Server error:', err);
  });
  return server;
}

module.exports = { createServer };

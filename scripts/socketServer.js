 // Init Socket
const net = require('net');
const dotenv = require('dotenv');

dotenv.config();

function createServer() {
    const server = net.createServer(socket => {
        console.log('Client connected');

        socket.on('data', (data) => {
            console.log('Received data:', data.toString());
        });

        socket.on('end', () => {
            console.log('Client disconnected');
        });
    });

    const host = process.env.HOST;
    const port = parseInt(process.env.PORT, 10);

    server.listen(port, host, () => {
        console.log(`Server listening on ${host}:${port}`);
    });
}

module.exports = { createServer };

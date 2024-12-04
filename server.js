import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
import cors from "cors"

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: "*",

}))
const server = new WebSocketServer({ port: 8080 });

// Store connected clients
const clients = new Set();

server.on('connection', (socket) => {
    console.log('Client connected');
    clients.add(socket);

    // Send a message to the client
    socket.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

    // Handle disconnection
    socket.on('close', () => {
        console.log('Client disconnected');
        clients.delete(socket);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

// Example endpoint for updates
app.post('/api/update', (req, res) => {
    const {count}=req.body;
    console.log("count",count);

    const updateMessage = { message: count+' Data has been updated!' };

    // Broadcast the update to all connected clients
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(updateMessage));
        }
    });

    res.status(200).send('Update notification sent to all clients.');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`HTTP server is running on http://localhost:${PORT}`);
});

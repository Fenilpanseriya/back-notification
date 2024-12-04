import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
import cors from "cors";
import { createServer } from 'http';

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: "*",
}));

// Create an HTTP server
const httpServer = createServer(app);

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server: httpServer });

// Store connected clients
const clients = new Set();

wss.on('connection', (socket) => {
    console.log('Client connected');
    clients.add(socket);

    // Send a welcome message to the client
    socket.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

    // Handle client disconnection
    socket.on('close', () => {
        console.log('Client disconnected');
        clients.delete(socket);
    });
});

console.log('WebSocket server is initialized.');

// API endpoint for updates
app.post('/api/update', (req, res) => {
    const { count } = req.body;
    console.log("Count:", count);

    const updateMessage = { message: `${count} Data has been updated!` };

    // Broadcast the update to all connected clients
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(updateMessage));
        }
    });

    res.status(200).send('Update notification sent to all clients.');
});

// Start the server on the same port
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

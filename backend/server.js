const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const stockRoutes = require('./routes/stockRoutes');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'https://stock-talk-web.vercel.app',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version', 'Authorization']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'https://stock-talk-web.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);

// WebSocket connection with authentication
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication token missing'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (error) {
        return next(new Error('Authentication failed'));
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.user.id);

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.user.id, 'Reason:', reason);
    });

    // Handle real-time stock updates
    socket.on('subscribe_stock', (symbol) => {
        try {
            socket.join(symbol);
            console.log(`User ${socket.user.id} subscribed to ${symbol}`);
        } catch (error) {
            console.error(`Error subscribing to ${symbol}:`, error);
            socket.emit('error', { message: 'Failed to subscribe to stock' });
        }
    });

    socket.on('unsubscribe_stock', (symbol) => {
        try {
            socket.leave(symbol);
            console.log(`User ${socket.user.id} unsubscribed from ${symbol}`);
        } catch (error) {
            console.error(`Error unsubscribing from ${symbol}:`, error);
            socket.emit('error', { message: 'Failed to unsubscribe from stock' });
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
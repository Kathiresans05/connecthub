import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import configuration
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import storyRoutes from './routes/storyRoutes.js';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }
} catch (error) {
    console.warn('⚠️ Could not create uploads directory (likely read-only filesystem):', error.message);
}

// Initialize Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Connect to MongoDB
// Connect to MongoDB
connectDB();

// Detailed Request Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Increase server timeout for large uploads
server.keepAliveTimeout = 900000; // 15 minutes
server.headersTimeout = 901000; // 15 minutes + 1s

// Middleware
app.use(cors({
    origin: true, // Allow any origin
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stories', storyRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'ConnectHub API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════╗
║   🚀 ConnectHub Server Running       ║
║   📍 Port: ${PORT}                     
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}
║   📡 Socket.io: Enabled              ║
╚═══════════════════════════════════════╝
  `);
    });
}

export default app;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    if (process.env.NODE_ENV !== 'production') {
        server.close(() => process.exit(1));
    }
});

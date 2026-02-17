import { Server } from 'socket.io';

// Store online users
const onlineUsers = new Map();

/**
 * Initialize Socket.io
 */
export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        // User goes online
        socket.on('user-online', (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit('user-status', { userId, status: 'online' });
            console.log(`User ${userId} is online`);
        });

        // Send message
        socket.on('send-message', (data) => {
            const { receiverId, message } = data;
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive-message', message);
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { receiverId, isTyping } = data;
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user-typing', {
                    userId: data.senderId,
                    isTyping,
                });
            }
        });

        // User goes offline
        socket.on('disconnect', () => {
            // Find and remove user from online users
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    io.emit('user-status', { userId, status: 'offline' });
                    console.log(`User ${userId} went offline`);
                    break;
                }
            }
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export default initSocket;

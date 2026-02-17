import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            // Connect to Socket.io server
            const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
                transports: ['websocket'],
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket connected');
                // Notify server that user is online
                newSocket.emit('user-online', user._id);
            });

            newSocket.on('user-status', ({ userId, status }) => {
                setOnlineUsers((prev) => {
                    const updated = new Set(prev);
                    if (status === 'online') {
                        updated.add(userId);
                    } else {
                        updated.delete(userId);
                    }
                    return updated;
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [user]);

    const value = {
        socket,
        onlineUsers,
    };

    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
};

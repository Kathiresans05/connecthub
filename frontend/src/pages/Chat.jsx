import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const { socket, onlineUsers } = useSocket();

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser]);

    // Listen for new messages
    useEffect(() => {
        if (socket) {
            socket.on('receive-message', (message) => {
                if (selectedUser && message.sender._id === selectedUser._id) {
                    setMessages((prev) => [...prev, message]);
                }
                // Update conversation list
                fetchConversations();
            });

            return () => {
                socket.off('receive-message');
            };
        }
    }, [socket, selectedUser]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            setConversations(data);
        } catch (error) {
            console.error('Conversations error:', error);
        }
        setLoading(false);
    };

    const fetchMessages = async (userId) => {
        try {
            const { data } = await api.get(`/messages/${userId}`);
            setMessages(data);
        } catch (error) {
            console.error('Messages error:', error);
        }
    };

    // Search Logic
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const performSearch = async () => {
        setIsSearching(true);
        try {
            const { data } = await api.get(`/users/search?q=${searchQuery}`);
            // Filter out current user
            const filtered = data.filter(u => u._id !== user._id);
            setSearchResults(filtered);
        } catch (error) {
            console.error('Search error:', error);
        }
        setIsSearching(false);
    };

    const handleSelectUser = (selected) => {
        // Check if we already have a conversation with this user
        const existingConv = conversations.find(c => c.user._id === selected._id);

        setSelectedUser(selected);
        setSearchQuery('');
        setSearchResults([]);

        // If no existing conversation, we rely on the selectedUser state 
        // to show the empty chat area. 
        // Fetching messages will likely return empty array which is correct.
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const { data } = await api.post('/messages', {
                receiver: selectedUser._id,
                text: newMessage,
            });

            setMessages((prev) => [...prev, data]);
            setNewMessage('');

            // Emit socket event
            if (socket) {
                socket.emit('send-message', {
                    receiverId: selectedUser._id,
                    message: data,
                });
            }

            // Update conversations
            fetchConversations();
        } catch (error) {
            console.error('Send message error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg pb-20">
            <Navbar />

            <div className="pt-28 h-[calc(100vh-7rem)] md:h-[calc(100vh-6.5rem)]">
                <div className="h-full max-w-6xl mx-auto flex border-x border-dark-border">
                    {/* Conversations List */}
                    <div className={`${selectedUser ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-dark-border overflow-y-auto`}>
                        <div className="p-4 border-b border-dark-border">
                            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>

                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        {searchQuery ? (
                            /* Search Results */
                            <div className="p-2">
                                {isSearching ? (
                                    <div className="text-center py-4 text-gray-500">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(user => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleSelectUser(user)}
                                            className="p-3 hover:bg-dark-hover rounded-lg cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <img
                                                src={user.profilePic}
                                                alt={user.username}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <h3 className="font-semibold text-white">{user.username}</h3>
                                                <p className="text-xs text-gray-400">Start a conversation</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500">No users found</div>
                                )}
                            </div>
                        ) : (
                            /* Existing Conversations */
                            conversations.length > 0 ? (
                                <div>
                                    {conversations.map((conv) => {
                                        const isOnline = onlineUsers.has(conv.user._id);
                                        return (
                                            <div
                                                key={conv.user._id}
                                                onClick={() => setSelectedUser(conv.user)}
                                                className={`p-4 border-b border-dark-border cursor-pointer transition-colors ${selectedUser?._id === conv.user._id
                                                    ? 'bg-dark-hover'
                                                    : 'hover:bg-dark-hover'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img
                                                            src={conv.user.profilePic}
                                                            alt={conv.user.username}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                        {isOnline && (
                                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-bg" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-white truncate">
                                                            {conv.user.username}
                                                        </h3>
                                                        <p className="text-sm text-gray-400 truncate">
                                                            {conv.lastMessage.text}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-gray-400">No conversations yet</p>
                                    <p className="text-xs text-gray-500 mt-2">Search for a user to start chatting</p>
                                </div>
                            )
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} w-full md:w-2/3 flex-col`}>
                        {selectedUser ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-dark-border flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="md:hidden text-gray-400 hover:text-white mr-2"
                                    >
                                        <ArrowLeft size={24} />
                                    </button>
                                    <div className="relative">
                                        <img
                                            src={selectedUser.profilePic}
                                            alt={selectedUser.username}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        {onlineUsers.has(selectedUser._id) && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-bg" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{selectedUser.username}</h3>
                                        <p className="text-xs text-gray-400">
                                            {onlineUsers.has(selectedUser._id) ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((message) => {
                                        const isSent = message.sender._id === user._id;
                                        return (
                                            <div
                                                key={message._id}
                                                className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs px-4 py-2 rounded-2xl ${isSent
                                                        ? 'bg-primary text-white'
                                                        : 'bg-dark-secondary text-white'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.text}</p>
                                                    <p className="text-xs mt-1 opacity-70">
                                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={sendMessage} className="p-4 border-t border-dark-border flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 bg-dark-secondary border border-dark-border rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="w-10 h-10 bg-primary hover:bg-primary-hover rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-gray-400">Select a conversation to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Chat;

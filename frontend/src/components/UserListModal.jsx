import { useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const UserListModal = ({ title, users, onClose }) => {
    const { user: currentUser, updateUser } = useAuth();
    const [loadingMap, setLoadingMap] = useState({});

    if (!users) return null;

    const isFollowing = (userId) => {
        return currentUser?.following?.includes(userId);
    };

    const handleFollowToggle = async (e, userId) => {
        e.preventDefault(); // Prevent navigation
        if (loadingMap[userId]) return;

        setLoadingMap((prev) => ({ ...prev, [userId]: true }));

        try {
            const isCurrentlyFollowing = isFollowing(userId);
            let updatedFollowing;

            if (isCurrentlyFollowing) {
                await api.post(`/users/unfollow/${userId}`);
                updatedFollowing = currentUser.following.filter((id) => id !== userId);
            } else {
                await api.post(`/users/follow/${userId}`);
                updatedFollowing = [...currentUser.following, userId];
            }

            updateUser({ following: updatedFollowing });
        } catch (error) {
            console.error('Follow toggle error:', error);
        } finally {
            setLoadingMap((prev) => ({ ...prev, [userId]: false }));
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-dark-secondary w-full max-w-md rounded-2xl border border-dark-border max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-border">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto p-4 space-y-4">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <Link
                                key={user._id}
                                to={`/profile/${user._id}`}
                                onClick={onClose}
                                className="flex items-center justify-between hover:bg-dark-hover p-2 rounded-xl transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={user.profilePic || 'https://via.placeholder.com/40'}
                                        alt={user.username}
                                        className="w-12 h-12 rounded-full object-cover border border-dark-border"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-white">{user.username}</h3>
                                        {user.bio && (
                                            <p className="text-gray-400 text-sm line-clamp-1">{user.bio}</p>
                                        )}
                                    </div>
                                </div>

                                {currentUser && currentUser._id !== user._id && (
                                    <button
                                        onClick={(e) => handleFollowToggle(e, user._id)}
                                        disabled={loadingMap[user._id]}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isFollowing(user._id)
                                                ? 'bg-dark-secondary border border-dark-border text-white hover:bg-dark-hover'
                                                : 'bg-primary text-white hover:bg-primary-hover'
                                            }`}
                                    >
                                        {loadingMap[user._id]
                                            ? 'Loading...'
                                            : isFollowing(user._id)
                                                ? 'Following'
                                                : 'Follow'}
                                    </button>
                                )}
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No users found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;

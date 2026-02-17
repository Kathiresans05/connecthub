import { useState, useRef } from 'react';
import { Send, X, Heart } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CommentModal = ({ post, onClose, onCommentAdded }) => {
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const inputRef = useRef(null);
    // Use local state for comments to update UI immediately
    const [comments, setComments] = useState(post.comments || []);
    const [replyingTo, setReplyingTo] = useState(null); // { commentId, username }

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d`;
        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks}w`;
    };

    const handleReply = (commentId, username) => {
        setReplyingTo({ commentId, username });
        setCommentText(`@${username} `);
        inputRef.current?.focus();
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setCommentText('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setLoading(true);
        try {
            let updatedComments;

            if (replyingTo) {
                // Handle reply
                const { data } = await api.post(`/posts/${post._id}/comment/${replyingTo.commentId}/reply`, {
                    text: commentText
                });

                const newReply = {
                    ...data,
                    user: {
                        _id: user._id,
                        username: user.username,
                        profilePic: user.profilePic
                    }
                };

                updatedComments = comments.map(comment => {
                    if (comment._id === replyingTo.commentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newReply]
                        };
                    }
                    return comment;
                });

                setReplyingTo(null);
            } else {
                // Handle regular comment
                const { data } = await api.post(`/posts/${post._id}/comment`, { text: commentText });

                const newComment = {
                    ...data,
                    user: {
                        _id: user._id,
                        username: user.username,
                        profilePic: user.profilePic
                    },
                    replies: []
                };
                updatedComments = [...comments, newComment];
            }

            setComments(updatedComments);
            setCommentText('');

            // Notify parent to update post state
            if (onCommentAdded) {
                onCommentAdded(post._id, updatedComments);
            }
        } catch (error) {
            console.error('Add comment error:', error);
        }
        setLoading(false);
    };

    const CommentItem = ({ comment, isReply = false, parentId = null }) => (
        <div className={`flex gap-3 w-full ${isReply ? 'mt-4 pl-8' : ''}`}>
            <img
                src={comment.user?.profilePic || 'https://via.placeholder.com/40'}
                alt={comment.user?.username}
                className={`${isReply ? 'w-6 h-6' : 'w-9 h-9'} rounded-full object-cover flex-shrink-0 border border-gray-800`}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white text-sm truncate">
                        {comment.user?.username}
                    </span>
                    <span className="text-gray-500 text-xs">
                        {comment.createdAt ? formatTimeAgo(comment.createdAt) : 'now'}
                    </span>
                </div>

                <p className="text-white text-sm mt-0.5 whitespace-pre-wrap break-words leading-snug">
                    {comment.text}
                </p>

                <button
                    onClick={() => handleReply(parentId || comment._id, comment.user?.username)}
                    className="text-gray-500 text-xs font-semibold mt-2 hover:text-gray-300 transition-colors"
                >
                    Reply
                </button>
            </div>

            <button className="flex flex-col items-center justify-center gap-1 self-start mt-1 group">
                <Heart size={14} className="text-gray-500 group-hover:text-gray-400" />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
            <div
                className="bg-dark-secondary w-full md:max-w-lg h-[85vh] md:h-auto md:max-h-[80vh] rounded-t-3xl md:rounded-2xl flex flex-col shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
                    <div className="w-12" /> {/* Spacer */}
                    <h3 className="text-white font-semibold text-base">
                        Comments {comments.length > 0 && `(${comments.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0)})`}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment._id || Date.now()}>
                                <CommentItem comment={comment} />
                                {/* Render Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="flex flex-col">
                                        {comment.replies.map((reply) => (
                                            <CommentItem
                                                key={reply._id || Date.now()}
                                                comment={reply}
                                                isReply={true}
                                                parentId={comment._id}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No comments yet</p>
                            <p className="text-sm text-gray-600 mt-1">Start the conversation</p>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 flex flex-col gap-2 bg-dark-secondary flex-shrink-0 relative z-10 w-full mb-0 md:rounded-b-2xl">
                    {replyingTo && (
                        <div className="flex items-center justify-between bg-gray-800/50 px-3 py-1.5 rounded-lg mb-1">
                            <span className="text-xs text-gray-300">
                                Replying to <span className="font-semibold">{replyingTo.username}</span>
                            </span>
                            <button
                                type="button"
                                onClick={cancelReply}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2 items-center w-full">
                        <img
                            src={user?.profilePic || 'https://via.placeholder.com/40'}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover border border-gray-700"
                        />
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
                                className="w-full bg-dark-bg text-white rounded-full py-3 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-primary border border-gray-700 placeholder-gray-500"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || loading}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${commentText.trim() ? 'text-primary' : 'text-gray-600'}`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentModal;

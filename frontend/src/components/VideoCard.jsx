import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Flag, EyeOff, Link2, Clapperboard, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import UploadModal from './UploadModal';

import CommentModal from './CommentModal';

const VideoCard = ({ post, isActive, onLike, onComment }) => {
    const [playing, setPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    const [localLikesCount, setLocalLikesCount] = useState(post.likes?.length || 0);
    const [localComments, setLocalComments] = useState(post.comments || []);
    const [showComments, setShowComments] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const videoRef = useRef(null);
    const { user } = useAuth();

    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const video = videoRef.current;

        if (isActive) {
            video?.play().catch(e => {
                // Ignore AbortError which happens if video is paused while loading
                if (e.name !== 'AbortError') console.log('Play failed:', e);
            });
            setPlaying(true);
        } else {
            video?.pause();
            setPlaying(false);
        }

        return () => {
            video?.pause();
        };
    }, [isActive]);

    useEffect(() => {
        // Check if user has liked this post
        if (user && post.likes?.includes(user._id)) {
            setLiked(true);
        }
        // Check if user is following the post author
        if (user && user.following?.includes(post.user._id)) {
            setIsFollowing(true);
        }
    }, [post, user]);

    const handleFollow = async () => {
        if (!user) return;
        try {
            if (isFollowing) {
                await api.post(`/users/unfollow/${post.user._id}`);
                setIsFollowing(false);
            } else {
                await api.post(`/users/follow/${post.user._id}`);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    const handleVideoClick = () => {
        if (videoRef.current) {
            if (playing) {
                videoRef.current.pause();
                setPlaying(false);
            } else {
                videoRef.current.play().catch(e => console.log('Click play failed:', e));
                setPlaying(true);
            }
        }
    };

    const handleLike = async () => {
        try {
            const { data } = await api.post(`/posts/${post._id}/like`);
            setLiked(data.liked);
            setLocalLikesCount(data.likesCount);
            if (onLike) onLike(post._id, data.liked);
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${post.user.username}'s video`,
                    text: post.caption,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Share failed:', error);
            }
        }
    };

    const navigate = useNavigate();

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await api.delete(`/posts/${post._id}`);
                setShowOptions(false);
                window.location.reload();
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete post');
            }
        }
    };

    // Extract hashtags from caption
    const renderCaption = () => {
        if (!post.caption) return null;
        const words = post.caption.split(' ');
        return words.map((word, index) => {
            if (word.startsWith('#')) {
                return (
                    <span key={index} className="text-primary">
                        {word}{' '}
                    </span>
                );
            }
            return word + ' ';
        });
    };

    return (
        <div className="relative h-screen w-full md:max-w-[450px] md:mx-auto md:border-x md:border-gray-800 snap-start snap-always flex items-center justify-center bg-black">
            {/* Video */}
            <video
                ref={videoRef}
                src={post.videoUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
                onClick={handleVideoClick}
            />

            {/* User Info & Caption (Bottom Left) */}
            <div className="absolute bottom-28 md:bottom-24 left-4 right-20 z-10">
                <div className="flex items-center gap-3 mb-3">
                    <Link to={`/profile/${post.user._id}`} className="flex items-center gap-3">
                        <img
                            src={post.user.profilePic}
                            alt={post.user.username}
                            className="w-11 h-11 rounded-full border-2 border-white object-cover"
                        />
                        <span className="font-semibold text-white text-base shadow-black drop-shadow-md">
                            {post.user.username}
                        </span>
                    </Link>

                    {user && user._id !== post.user._id && (
                        <button
                            onClick={handleFollow}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${isFollowing
                                ? 'border-gray-400 text-white bg-transparent'
                                : 'border-primary bg-primary text-white'
                                }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>

                {post.caption && (
                    <p className="text-white text-sm leading-relaxed drop-shadow-md">
                        {renderCaption()}
                    </p>
                )}
            </div>

            {/* Action Buttons (Right Side) */}
            <div className="absolute bottom-28 md:bottom-24 right-4 flex flex-col gap-5 z-10">
                {/* Like */}
                <button
                    onClick={handleLike}
                    className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${liked ? 'bg-accent-pink' : 'bg-dark-secondary/80 backdrop-blur-sm'
                        }`}>
                        <Heart
                            size={24}
                            fill={liked ? '#fff' : 'none'}
                            className={liked ? 'text-white' : 'text-white'}
                        />
                    </div>
                    <span className="text-white text-xs font-medium">
                        {localLikesCount > 0 ? `${localLikesCount}${localLikesCount >= 1000 ? 'k' : ''}` : ''}
                    </span>
                </button>

                {/* Comment */}
                <button
                    onClick={() => setShowComments(true)}
                    className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                >
                    <div className="w-12 h-12 rounded-full bg-dark-secondary/80 backdrop-blur-sm flex items-center justify-center">
                        <MessageCircle size={24} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-medium">
                        {localComments.length > 0 ? localComments.length : ''}
                    </span>
                </button>

                {/* Share */}
                <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                >
                    <div className="w-12 h-12 rounded-full bg-dark-secondary/80 backdrop-blur-sm flex items-center justify-center">
                        <Share2 size={24} className="text-white" />
                    </div>
                </button>

                {/* Save */}
                <button className="flex flex-col items-center gap-1 transition-transform active:scale-90">
                    <div className="w-12 h-12 rounded-full bg-dark-secondary/80 backdrop-blur-sm flex items-center justify-center">
                        <Bookmark size={24} className="text-white" />
                    </div>
                </button>

                {/* More Options / Settings */}
                <button
                    onClick={() => setShowOptions(true)}
                    className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                >
                    <div className="w-12 h-12 rounded-full bg-dark-secondary/80 backdrop-blur-sm flex items-center justify-center">
                        <MoreVertical size={24} className="text-white" />
                    </div>
                </button>
            </div>

            {/* Comments Modal */}
            {showComments && (
                <CommentModal
                    post={{ ...post, comments: localComments }}
                    onClose={() => setShowComments(false)}
                    onCommentAdded={(_, updatedComments) => setLocalComments(updatedComments)}
                />
            )}

            {/* Options Modal */}
            {showOptions && (
                <div className="absolute inset-0 bg-black/50 z-20" onClick={() => setShowOptions(false)}>
                    <div className="absolute bottom-0 left-0 right-0 bg-dark-secondary rounded-t-3xl p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />

                        <div className="space-y-2">
                            <button className="w-full text-left p-4 hover:bg-dark-hover rounded-xl text-white font-medium flex items-center gap-3">
                                <Flag size={20} /> Report
                            </button>
                            <button className="w-full text-left p-4 hover:bg-dark-hover rounded-xl text-white font-medium flex items-center gap-3">
                                <EyeOff size={20} /> Not Interested
                            </button>
                            <button className="w-full text-left p-4 hover:bg-dark-hover rounded-xl text-white font-medium flex items-center gap-3">
                                <Link2 size={20} /> Copy Link
                            </button>

                            {/* Delete Option (Only for owner) */}
                            {user && user._id === post.user._id && (
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left p-4 hover:bg-dark-hover rounded-xl text-red-500 font-medium flex items-center gap-3"
                                >
                                    <Trash2 size={20} /> Delete
                                </button>
                            )}
                            <button
                                onClick={() => setShowOptions(false)}
                                className="w-full text-center p-4 text-gray-400 hover:text-white mt-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Button (Clapperboard) */}
            <button
                onClick={() => setShowUpload(true)}
                className="absolute top-6 right-4 z-20 text-white/80 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-sm"
            >
                <Clapperboard size={28} />
            </button>

            {/* Upload Modal */}
            {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
        </div>
    );
};

export default VideoCard;

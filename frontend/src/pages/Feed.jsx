import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Plus, Image, Video, Smile } from 'lucide-react';
import Navbar from '../components/Navbar';

import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

import CommentModal from '../components/CommentModal';
import UploadModal from '../components/UploadModal';
import StoryViewer from '../components/StoryViewer';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [showStoryUpload, setShowStoryUpload] = useState(false);
    const [stories, setStories] = useState([]);
    const [viewingStoryUserIndex, setViewingStoryUserIndex] = useState(null);

    useEffect(() => {
        fetchFeed();
        fetchStories();
    }, []);

    const fetchFeed = async () => {
        try {
            const { data } = await api.get('/posts/feed?limit=20');
            setPosts(data.posts);
        } catch (error) {
            console.error('Feed error:', error);
        }
        setLoading(false);
    };

    const fetchStories = async () => {
        try {
            const { data } = await api.get('/stories/feed');
            setStories(data);
        } catch (error) {
            console.error('Stories error:', error);
        }
    };

    const handleStoryUploadSuccess = () => {
        setShowStoryUpload(false);
        fetchStories(); // Refresh stories
        alert('Story uploaded!');
    };

    const handleStoryClick = (index) => {
        setViewingStoryUserIndex(index);
    };

    // ... existing handleLike ...

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

            {/* Story Upload Modal */}
            {showStoryUpload && (
                <UploadModal
                    onClose={() => setShowStoryUpload(false)}
                    isStory={true}
                    onSuccess={handleStoryUploadSuccess}
                />
            )}

            {/* Story Viewer */}
            {viewingStoryUserIndex !== null && (
                <StoryViewer
                    stories={stories}
                    initialUserIndex={viewingStoryUserIndex}
                    onClose={() => setViewingStoryUserIndex(null)}
                />
            )}

            <div className="pt-32 px-4 max-w-2xl mx-auto pb-20">
                {/* Stories Section */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar mb-6 pb-2">
                    {/* Current User Story */}
                    <div
                        className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer"
                        onClick={() => setShowStoryUpload(true)}
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full p-[2px] border-2 border-dark-border">
                                <img
                                    src={user?.profilePic || 'https://via.placeholder.com/150'}
                                    alt="Your Story"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-0.5 border-2 border-dark-bg">
                                <Plus size={14} />
                            </div>
                        </div>
                        <span className="text-xs text-gray-400">Your Story</span>
                    </div>

                    {/* Real Stories */}
                    {stories.map((userStoryGroup, index) => (
                        <div
                            key={userStoryGroup.user._id}
                            className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer"
                            onClick={() => handleStoryClick(index)}
                        >
                            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-primary to-accent-pink">
                                <div className="w-full h-full rounded-full border-2 border-dark-bg overflow-hidden">
                                    <img
                                        src={userStoryGroup.user.profilePic}
                                        alt={userStoryGroup.user.username}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <span className="text-xs text-gray-300">{userStoryGroup.user.username}</span>
                        </div>
                    ))}
                </div>


                {/* Create Post Input */}
                <div className="bg-dark-secondary rounded-xl p-4 mb-6 border border-dark-border">
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src={user?.profilePic || 'https://via.placeholder.com/40'}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div
                            onClick={() => navigate('/upload')}
                            className="flex-1 bg-dark-bg rounded-full px-4 py-2.5 text-gray-400 cursor-pointer hover:bg-dark-hover transition-colors"
                        >
                            What's on your mind, {user?.username}?
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-dark-border pt-3">
                        <button onClick={() => navigate('/upload?type=photo')} className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors text-sm font-medium">
                            <Image size={20} className="text-green-500" />
                            Photo
                        </button>
                        <button onClick={() => navigate('/upload?type=video')} className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors text-sm font-medium">
                            <Video size={20} className="text-blue-500" />
                            Video
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium">
                            <Smile size={20} className="text-orange-500" />
                            Feeling
                        </button>
                    </div>
                </div>

                {posts.length > 0 ? (
                    <div className="space-y-6">
                        {posts.filter(post => post.imageUrl).map((post) => {
                            const isLiked = post.likes.includes(user._id);

                            return (
                                <div key={post._id} className="bg-dark-secondary rounded-xl overflow-hidden border border-dark-border">
                                    {/* User Info */}
                                    <div className="p-4 flex items-center gap-3">
                                        <Link to={`/profile/${post.user._id}`}>
                                            <img
                                                src={post.user.profilePic}
                                                alt={post.user.username}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </Link>
                                        <Link to={`/profile/${post.user._id}`}>
                                            <h3 className="font-semibold text-white hover:text-gray-300">
                                                {post.user.username}
                                            </h3>
                                        </Link>
                                        <span className="text-gray-500 text-sm ml-auto">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Media Content */}
                                    {post.imageUrl ? (
                                        <img
                                            src={post.imageUrl}
                                            alt="Post content"
                                            className="w-full h-auto object-cover"
                                        />
                                    ) : (
                                        <video
                                            src={post.videoUrl}
                                            controls
                                            className="w-full aspect-[9/16] bg-black object-contain"
                                        />
                                    )}

                                    {/* Actions */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-6 mb-3">
                                            <button
                                                onClick={() => handleLike(post._id)}
                                                className="flex items-center gap-2 transition-colors"
                                            >
                                                <Heart
                                                    size={24}
                                                    fill={isLiked ? '#FF4D6D' : 'none'}
                                                    className={isLiked ? 'text-accent-pink' : 'text-gray-400 hover:text-white'}
                                                />
                                                <span className="text-white font-medium">{post.likes.length}</span>
                                            </button>

                                            <button
                                                onClick={() => setActiveCommentPostId(post._id)}
                                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <MessageCircle size={24} />
                                                <span className="text-white font-medium">{post.comments.length}</span>
                                            </button>

                                            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto">
                                                <Share2 size={24} />
                                            </button>
                                        </div>

                                        {/* Caption */}
                                        {post.caption && (
                                            <p className="text-white text-sm">
                                                <Link to={`/profile/${post.user._id}`} className="font-semibold mr-2">
                                                    {post.user.username}
                                                </Link>
                                                {post.caption}
                                            </p>
                                        )}

                                        {/* Comments Preview */}
                                        {post.comments.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {post.comments.slice(0, 2).map((comment) => (
                                                    <p key={comment._id} className="text-sm text-gray-300">
                                                        <span className="font-semibold">{comment.user.username}</span>{' '}
                                                        {comment.text}
                                                    </p>
                                                ))}
                                                {post.comments.length > 2 && (
                                                    <button
                                                        onClick={() => setActiveCommentPostId(post._id)}
                                                        className="text-sm text-gray-500 hover:text-gray-400"
                                                    >
                                                        View all {post.comments.length} comments
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No posts yet</p>
                    </div>
                )}
            </div>

            {/* Comment Modal */}
            {activeCommentPostId && (
                <CommentModal
                    post={posts.find((p) => p._id === activeCommentPostId)}
                    onClose={() => setActiveCommentPostId(null)}
                    onCommentAdded={handleCommentAdded}
                />
            )}
        </div>
    );
};

export default Feed;

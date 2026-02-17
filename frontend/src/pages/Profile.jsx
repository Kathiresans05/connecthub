import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Grid3x3, Heart, MessageCircle, Clapperboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import UserListModal from '../components/UserListModal';
import EditProfileModal from '../components/EditProfileModal';

import api from '../utils/api';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [activeTab, setActiveTab] = useState('posts');
    const navigate = useNavigate();

    const isOwnProfile = currentUser?._id === id;

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get(`/users/${id}`);
            setProfile(data.user);
            setPosts(data.posts);
            setFollowersCount(data.followersCount);
            setFollowingCount(data.followingCount);

            // Check if current user follows this profile
            if (currentUser && data.user.followers.includes(currentUser._id)) {
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Profile error:', error);
        }
        setLoading(false);
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await api.post(`/users/unfollow/${id}`);
                setFollowersCount((prev) => prev - 1);
                setIsFollowing(false);
            } else {
                await api.post(`/users/follow/${id}`);
                setFollowersCount((prev) => prev + 1);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        users: []
    });

    const [showEditProfile, setShowEditProfile] = useState(false);

    const handleProfileUpdate = (updatedUser) => {
        setProfile((prev) => ({ ...prev, ...updatedUser }));
    };

    const openFollowersModal = () => {
        setModalConfig({
            isOpen: true,
            title: 'Followers',
            users: profile?.followers || []
        });
    };

    const openFollowingModal = () => {
        setModalConfig({
            isOpen: true,
            title: 'Following',
            users: profile?.following || []
        });
    };

    const closeModal = () => {
        setModalConfig({ ...modalConfig, isOpen: false });
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

            <div className="pt-32 px-4 max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="flex items-start gap-6 mb-8">
                    <img
                        src={profile?.profilePic}
                        alt={profile?.username}
                        className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-2 border-dark-border"
                    />

                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-xl md:text-2xl font-bold text-white">
                                {profile?.username}
                            </h1>

                            {isOwnProfile ? (
                                <button
                                    onClick={() => setShowEditProfile(true)}
                                    className="px-4 py-1.5 bg-dark-secondary hover:bg-dark-hover border border-dark-border rounded-lg text-white font-medium text-sm transition-colors flex items-center gap-2"
                                >
                                    <Settings size={16} />
                                    Edit
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    className={`px-6 py-1.5 rounded-lg font-medium text-sm transition-colors ${isFollowing
                                        ? 'bg-dark-secondary hover:bg-dark-hover border border-dark-border text-white'
                                        : 'bg-primary hover:bg-primary-hover text-white'
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 mb-4">
                            <div className="text-center">
                                <p className="text-white font-semibold text-lg">{posts.length}</p>
                                <p className="text-gray-400 text-sm">Posts</p>
                            </div>
                            <div className="text-center cursor-pointer hover:bg-dark-hover rounded-lg px-2 -mx-2 transition-colors" onClick={openFollowersModal}>
                                <p className="text-white font-semibold text-lg">{followersCount}</p>
                                <p className="text-gray-400 text-sm">Followers</p>
                            </div>
                            <div className="text-center cursor-pointer hover:bg-dark-hover rounded-lg px-2 -mx-2 transition-colors" onClick={openFollowingModal}>
                                <p className="text-white font-semibold text-lg">{followingCount}</p>
                                <p className="text-gray-400 text-sm">Following</p>
                            </div>
                        </div>

                        {/* Bio */}
                        {profile?.bio && (
                            <p className="text-gray-300 text-sm">{profile.bio}</p>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-dark-border mb-6">
                    <div className="flex items-center justify-center gap-12 text-sm font-medium">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex items-center gap-2 py-3 border-t-2 -mt-px transition-colors ${activeTab === 'posts'
                                ? 'border-white text-white'
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Grid3x3 size={20} />
                            <span>Posts</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('shorts')}
                            className={`flex items-center gap-2 py-3 border-t-2 -mt-px transition-colors ${activeTab === 'shorts'
                                ? 'border-white text-white'
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Clapperboard size={20} />
                            <span>Shorts</span>
                        </button>
                    </div>
                </div>

                {/* Posts Grid */}
                {/* 
                    Currently all posts are videos (shorts).
                    - 'posts' tab shows everything (posts + shorts)
                    - 'shorts' tab shows only shorts
                    Since we only have 'shorts' data technically, both will show the same content for now.
                    In a real scenario, we would filter:
                    const displayPosts = activeTab === 'shorts' ? posts.filter(p => p.type === 'short') : posts;
                */}
                {/* Filter posts based on tab */}
                {posts.filter(post => activeTab === 'posts' || (activeTab === 'shorts' && post.videoUrl)).length > 0 ? (
                    <div className="grid grid-cols-3 gap-1">
                        {posts
                            .filter(post => activeTab === 'posts' || (activeTab === 'shorts' && post.videoUrl))
                            .map((post) => (
                                <div key={post._id}
                                    className="aspect-[9/16] bg-dark-secondary rounded-lg overflow-hidden cursor-pointer group relative"
                                    onClick={() => navigate(`/post/${post._id}`)}
                                >
                                    {post.imageUrl ? (
                                        <img
                                            src={post.imageUrl}
                                            alt="Post content"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <video
                                            src={post.videoUrl}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <div className="flex items-center gap-1 text-white">
                                            <Heart size={20} fill="white" />
                                            <span className="font-medium">{post.likes.length}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-white">
                                            <MessageCircle size={20} fill="white" />
                                            <span className="font-medium">{post.comments.length}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No posts yet</p>
                    </div>
                )}
            </div>

            {/* User List Modal */}
            {modalConfig.isOpen && (
                <UserListModal
                    title={modalConfig.title}
                    users={modalConfig.users}
                    onClose={closeModal}
                />
            )}

            {/* Edit Profile Modal */}
            {showEditProfile && (
                <EditProfileModal
                    user={profile}
                    onClose={() => setShowEditProfile(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default Profile;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../utils/api';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExplorePosts();
    }, []);

    const fetchExplorePosts = async () => {
        try {
            // Reusing feed endpoint for now, but ideally this would be a trending/random endpoint
            const { data } = await api.get('/posts/feed?limit=21');
            setPosts(data.posts);
        } catch (error) {
            console.error('Explore error:', error);
        }
        setLoading(false);
    };

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
            setSearchResults(data);
        } catch (error) {
            console.error('Search error:', error);
        }
        setIsSearching(false);
    };

    return (
        <div className="min-h-screen bg-dark-bg pb-20">
            {/* Search Bar */}
            <div className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-md p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="w-full bg-dark-secondary text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Search Results (Users) */}
            {searchQuery ? (
                <div className="px-4">
                    {isSearching ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-4">
                            {searchResults.map((user) => (
                                <Link
                                    key={user._id}
                                    to={`/profile/${user._id}`}
                                    className="flex items-center gap-3 p-3 bg-dark-secondary rounded-xl"
                                >
                                    <img
                                        src={user.profilePic}
                                        alt={user.username}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-white">{user.username}</h3>
                                        <p className="text-gray-400 text-sm truncate">{user.bio || 'No bio'}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No users found for "{searchQuery}"
                        </div>
                    )}
                </div>
            ) : (
                /* Default Explore Grid */
                <div className="grid grid-cols-3 gap-1 md:gap-2 px-1">
                    {posts.map((post) => (
                        <Link key={post._id} to={`/posts/${post._id}`} className="relative aspect-[3/4] group">
                            <video
                                src={post.videoUrl}
                                className="w-full h-full object-cover rounded-md"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                        </Link>
                    ))}
                </div>
            )}

            {!searchQuery && loading && (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            )}
        </div>
    );
};

export default Explore;

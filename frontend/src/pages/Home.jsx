import { useState, useEffect, useCallback } from 'react';
import { useInView, InView } from 'react-intersection-observer';
import VideoCard from '../components/VideoCard';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const { ref: loadMoreRef, inView } = useInView();

    const [activeIndex, setActiveIndex] = useState(0);

    // Fetch feed
    const fetchFeed = useCallback(async (pageNum) => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const { data } = await api.get(`/posts/feed?page=${pageNum}&limit=10`);
            setPosts((prev) => [...prev, ...data.posts]);
            setHasMore(pageNum < data.totalPages);
        } catch (error) {
            console.error('Feed error:', error);
        }
        setLoading(false);
    }, [loading, hasMore]);

    useEffect(() => {
        fetchFeed(1);
    }, []);

    // Load more when scrolling
    useEffect(() => {
        if (inView && hasMore && !loading) {
            setPage((prev) => prev + 1);
            fetchFeed(page + 1);
        }
    }, [inView, hasMore, loading, page]);



    return (
        <div className="min-h-screen bg-black">
            <Navbar />
            {/* Snap container for vertical scrolling */}
            <div className="snap-y snap-mandatory h-screen overflow-y-scroll no-scrollbar">
                {posts.map((post, index) => (
                    <InView
                        key={post._id}
                        threshold={0.5}
                        onChange={(inView) => {
                            if (inView) {
                                setActiveIndex(index);
                            }
                        }}
                    >
                        {({ ref }) => (
                            <div
                                ref={ref}
                                className="snap-start h-screen w-full"
                            >
                                <VideoCard post={post} isActive={index === activeIndex} />
                            </div>
                        )}
                    </InView>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className="h-screen flex items-center justify-center bg-black">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                )}

                {/* Load more trigger */}
                {!loading && hasMore && <div ref={loadMoreRef} className="h-10" />}

                {/* No more posts */}
                {!hasMore && posts.length > 0 && (
                    <div className="h-screen flex items-center justify-center bg-black">
                        <p className="text-gray-400">No more videos</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && posts.length === 0 && (
                    <div className="h-screen flex items-center justify-center bg-black">
                        <div className="text-center">
                            <p className="text-gray-400 text-lg mb-4">No videos yet</p>
                            <p className="text-gray-500">Be the first to upload!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;

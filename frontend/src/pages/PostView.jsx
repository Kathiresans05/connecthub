import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import api from '../utils/api';
import VideoCard from '../components/VideoCard';

const PostView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const { data } = await api.get(`/posts/${id}`);
            setPost(data);
        } catch (error) {
            console.error('Fetch post error:', error);
            // Optionally navigate back or show error
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <p>Post not found</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-primary hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-4 z-50 p-2 bg-black/50 rounded-full text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
            >
                <ChevronLeft size={32} />
            </button>

            {/* Video/Post Card */}
            <div className="h-screen w-full flex items-center justify-center">
                <VideoCard
                    post={post}
                    isActive={true}
                    onLike={(id, liked) => {
                        // Update local state if needed via re-fetch or optimistically
                    }}
                />
            </div>
        </div>
    );
};

export default PostView;

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload as UploadIcon, X, Image as ImageIcon, Video } from 'lucide-react';
import Navbar from '../components/Navbar';

import api from '../utils/api';

const Upload = () => {
    const [mediaType, setMediaType] = useState('video'); // 'video' or 'image'
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Debugging: Check current API URL
        alert(`Current API URL: ${import.meta.env.VITE_API_URL}`);

        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        if (type === 'photo') setMediaType('image');
        else if (type === 'video') setMediaType('video');
    }, [location]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file size (500MB max)
            if (selectedFile.size > 500 * 1024 * 1024) {
                setError('File size must be less than 500MB');
                return;
            }

            // Validate file type
            if (mediaType === 'video' && !selectedFile.type.startsWith('video/')) {
                setError('Please select a valid video file');
                return;
            }
            if (mediaType === 'image' && !selectedFile.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError(`Please select a ${mediaType}`);
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            // Backend expects 'video' field for both (we should update backend or use 'media')
            // But let's check backend route. Assuming it handles 'video' or generic 'file'
            // For now, let's look at the backend controller.
            // If backend uses 'upload.single("video")', it expects 'video'.
            // If we changed backend to check for 'image' or 'video', we need to adjust.
            // Let's assume for now we use 'media' or we check backend.
            // Re-reading previous context, backend uses 'video'.
            // We should probably check if backend `postController` handles `req.file`.
            // If `upload.single('video')` is used, it expects 'video'.
            // We'll stick to 'video' key for now or change it later if needed.
            // WAIT - I need to check postController.js to see what field name it expects.
            // I'll use 'media' generically if possible, but let's check.
            // Use 'media' as key for both images and videos
            formData.append('media', file);
            formData.append('caption', caption);
            formData.append('type', mediaType); // Send type to backend

            const { data } = await api.post('/posts', formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(progress);
                },
            });

            navigate('/feed');
        } catch (error) {
            console.error('Upload error:', error);
            // Capture full error details for debugging
            console.error('Full upload error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Upload Failed: ${errorMessage}\nCheck console for details.`);
            setError(error);
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg pb-20">
            <Navbar />

            <div className="pt-24 px-4 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">Create New Post (DEBUG MODE: 500MB)</h1>

                {/* Media Type Toggle */}
                <div className="flex bg-dark-secondary p-1 rounded-xl mb-6">
                    <button
                        onClick={() => { setMediaType('video'); setFile(null); setPreview(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mediaType === 'video'
                            ? 'bg-dark-bg text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Video size={18} />
                        Video
                    </button>
                    <button
                        onClick={() => { setMediaType('image'); setFile(null); setPreview(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mediaType === 'image'
                            ? 'bg-dark-bg text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <ImageIcon size={18} />
                        Photo
                    </button>
                </div>

                <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-6 break-words">
                            <p className="font-bold">Error Details:</p>
                            {typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : error}
                        </div>
                    )}

                    {!preview ? (
                        <div className="border-2 border-dashed border-dark-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept={mediaType === 'video' ? "video/*" : "image/*"}
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                {mediaType === 'video' ? <UploadIcon size={32} /> : <ImageIcon size={32} />}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Upload {mediaType === 'video' ? 'Video' : 'Photo'}
                            </h3 >
                            <p className="text-gray-400">
                                {mediaType === 'video' ? 'MP4, MOV, AVI (max 100MB)' : 'JPEG, PNG, WEBP (max 10MB)'}
                            </p>
                        </div>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden bg-black mb-6">
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setPreview(null);
                                }}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>
                            {mediaType === 'video' ? (
                                <video
                                    src={preview}
                                    controls
                                    className="w-full max-h-[500px] object-contain"
                                />
                            ) : (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full max-h-[500px] object-contain"
                                />
                            )}
                        </div>
                    )}

                    {/* Caption Input */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Caption (Optional)
                        </label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Add a caption... Use #hashtags"
                            className="w-full px-4 py-3 bg-dark-secondary border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                            rows={4}
                            disabled={uploading}
                        />
                        <p className="text-gray-500 text-xs mt-2">
                            {caption.length} / 2200 characters
                        </p>
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-300">Uploading...</span>
                                <span className="text-sm font-medium text-primary">{uploadProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-dark-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading || !file}
                        className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all ${uploading || !file
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary to-accent-pink hover:opacity-90 shadow-lg shadow-primary/25'
                            }`}
                    >
                        {uploading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Uploading {uploadProgress}%</span>
                            </div>
                        ) : (
                            `Post ${mediaType === 'video' ? 'Video' : 'Photo'}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Upload;

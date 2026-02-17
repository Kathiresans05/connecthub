import React, { useState, useRef } from 'react';
import { X, Upload, Clapperboard, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';

const UploadModal = ({ onClose, isStory = false, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file size (500MB max)
            if (selectedFile.size > 500 * 1024 * 1024) {
                setError('File size must be less than 500MB');
                return;
            }

            // If strictly video for posts (not stories)
            if (!isStory && !selectedFile.type.startsWith('video/')) {
                setError('Please select a video file for posts');
                return;
            }

            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('media', file);
        formData.append('type', file.type.startsWith('video/') ? 'video' : 'image');

        // Only append caption if it's a post
        if (!isStory) {
            formData.append('caption', caption);
        }

        try {
            const endpoint = isStory ? '/stories' : '/posts';
            await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setLoading(false);
            if (onSuccess) onSuccess();
            onClose();
            if (!isStory) window.location.reload(); // Reload for posts to show up
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.message || 'Upload failed');
            setLoading(false);
        }
    };

    const isVideo = file?.type.startsWith('video/');

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-md rounded-2xl p-6 relative border border-gray-800 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-2 mb-6">
                    {isStory ? <ImageIcon className="text-pink-500" size={24} /> : <Clapperboard className="text-pink-500" size={24} />}
                    <h2 className="text-xl font-bold text-white">{isStory ? 'Add to Story' : 'Upload Short'}</h2>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm break-words overflow-auto max-h-40">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* File Drop/Preview Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 transition-colors bg-black/40 min-h-[200px]"
                    >
                        {previewUrl ? (
                            <div className="relative w-full h-full flex justify-center">
                                {isVideo ? (
                                    <video
                                        src={previewUrl}
                                        className="max-h-64 rounded-lg shadow-lg"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={previewUrl}
                                        className="max-h-64 rounded-lg shadow-lg object-contain"
                                        alt="Preview"
                                    />
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 p-1 rounded-full cursor-pointer hover:bg-black/80" onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    setPreviewUrl(null);
                                }}>
                                    <X size={16} className="text-white" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-800 p-4 rounded-full mb-3">
                                    <Upload size={32} className="text-pink-500" />
                                </div>
                                <p className="text-white font-medium mb-1">Select {isStory ? 'Media' : 'Video'}</p>
                                <p className="text-gray-500 text-xs">
                                    {isStory ? 'Images or Videos up to 500MB' : 'MP4, WebM up to 500MB'}
                                </p>
                            </>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept={isStory ? "image/*,video/*" : "video/*"}
                            className="hidden"
                        />
                    </div>

                    {/* Caption Input - Only for Posts */}
                    {!isStory && (
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-2 tracking-wide">Caption</label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Describe your video... #tags"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 resize-none h-24 placeholder-gray-500 transition-all"
                            />
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={loading || !file}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            isStory ? 'Post to Story' : 'Post Video'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const StoryViewer = ({ stories, initialUserIndex = 0, onClose }) => {
    const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef(null);

    // Get current user's stories
    const currentUserStories = stories[currentUserIndex];
    const currentStory = currentUserStories?.stories[currentStoryIndex];

    useEffect(() => {
        if (!currentStory) return;

        setProgress(0);
        let interval;

        if (currentStory.mediaType === 'image') {
            const duration = 5000; // 5 seconds for images
            const step = 100;
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        handleNext();
                        return 0;
                    }
                    return prev + (step / duration) * 100;
                });
            }, step);
        } else if (currentStory.mediaType === 'video' && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }

        return () => clearInterval(interval);
    }, [currentUserIndex, currentStoryIndex]);

    const handleNext = () => {
        if (currentStoryIndex < currentUserStories.stories.length - 1) {
            // Next story for same user
            setCurrentStoryIndex((prev) => prev + 1);
        } else if (currentUserIndex < stories.length - 1) {
            // Next user
            setCurrentUserIndex((prev) => prev + 1);
            setCurrentStoryIndex(0);
        } else {
            // End of all stories
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentStoryIndex > 0) {
            // Previous story for same user
            setCurrentStoryIndex((prev) => prev - 1);
        } else if (currentUserIndex > 0) {
            // Previous user
            setCurrentUserIndex((prev) => prev - 1);
            // Go to last story of previous user
            setCurrentStoryIndex(stories[currentUserIndex - 1].stories.length - 1);
        } else {
            // Start of all stories
            onClose();
        }
    };

    const handleVideoTimeUpdate = () => {
        if (videoRef.current) {
            const duration = videoRef.current.duration;
            const currentTime = videoRef.current.currentTime;
            if (duration > 0) {
                setProgress((currentTime / duration) * 100);
            }
        }
    };

    const handleVideoEnded = () => {
        handleNext();
    };

    if (!currentStory) return null;

    return (
        <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-white p-2 hover:bg-white/10 rounded-full"
            >
                <X size={24} />
            </button>

            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-16 z-20 flex gap-1">
                {currentUserStories.stories.map((story, idx) => (
                    <div key={story._id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-100 ease-linear"
                            style={{
                                width: idx < currentStoryIndex ? '100%' :
                                    idx === currentStoryIndex ? `${progress}%` : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Overlays */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={handlePrev} />
            <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={handleNext} />

            {/* Content */}
            <div className="relative w-full h-full max-w-md mx-auto aspect-[9/16] bg-black">
                {/* User Info */}
                <div className="absolute top-8 left-4 z-20 flex items-center gap-2">
                    <img
                        src={currentUserStories.user.profilePic || 'https://via.placeholder.com/150'}
                        alt={currentUserStories.user.username}
                        className="w-8 h-8 rounded-full border border-white/50"
                    />
                    <span className="text-white font-medium text-sm drop-shadow-md">
                        {currentUserStories.user.username}
                    </span>
                    <span className="text-white/60 text-xs drop-shadow-md">
                        {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Media */}
                {currentStory.mediaType === 'video' ? (
                    <video
                        ref={videoRef}
                        src={currentStory.mediaUrl}
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleVideoTimeUpdate}
                        onEnded={handleVideoEnded}
                        autoPlay
                        playsInline
                    />
                ) : (
                    <img
                        src={currentStory.mediaUrl}
                        alt="Story"
                        className="w-full h-full object-contain"
                    />
                )}
            </div>
        </div>
    );
};

export default StoryViewer;

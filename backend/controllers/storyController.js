import Story from '../models/Story.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
const createStory = async (req, res) => {
    try {
        const { type } = req.body; // 'image' or 'video'

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        let result;
        if (type === 'video') {
            result = await cloudinary.uploader.upload(req.file.path, {
                resource_type: 'video',
                folder: 'stories',
            });
        } else {
            result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'stories',
            });
        }

        const story = await Story.create({
            user: req.user._id,
            mediaUrl: result.secure_url,
            mediaType: type || 'image',
        });

        await story.populate('user', 'username profilePic');

        res.status(201).json(story);
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get stories for feed
// @route   GET /api/stories/feed
// @access  Private
const getStoriesFlow = async (req, res) => {
    try {
        // Get current user's following list
        const currentUser = await User.findById(req.user._id);
        const following = currentUser.following;

        // Fetch stories from users followed by current user AND current user's own stories
        // The stories are automatically filtered by TTL in MongoDB, so we just query all valid ones.
        const stories = await Story.find({
            user: { $in: [...following, req.user._id] },
        })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePic');

        // Group stories by user
        const groupedStories = stories.reduce((acc, story) => {
            const userId = story.user._id.toString();
            if (!acc[userId]) {
                acc[userId] = {
                    user: story.user,
                    stories: [],
                };
            }
            acc[userId].stories.push(story);
            return acc;
        }, {});

        res.json(Object.values(groupedStories));
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { createStory, getStoriesFlow };

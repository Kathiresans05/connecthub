import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { uploadVideo, uploadImage } from '../config/cloudinary.js';
import fs from 'fs';

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res) => {
    try {
        console.log('Create post request body:', req.body);
        console.log('Create post request file:', req.file);

        const { caption, type } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        let result;
        let videoUrl = '';
        let imageUrl = '';

        // Check file type from mimetype
        const isImage = req.file.mimetype.startsWith('image/');
        const isVideo = req.file.mimetype.startsWith('video/');

        if (isImage || type === 'image') {
            // Upload image to Cloudinary
            console.log(`Starting Cloudinary Image Upload: ${req.file.size / 1024 / 1024} MB`);
            const startTime = Date.now();
            result = await uploadImage(req.file.path);
            console.log(`Cloudinary Image Upload Completed in ${(Date.now() - startTime) / 1000}s`);
            imageUrl = result.secure_url;
        } else if (isVideo || type === 'video') {
            // Upload video to Cloudinary
            console.log(`Starting Cloudinary Video Upload: ${req.file.size / 1024 / 1024} MB`);
            const startTime = Date.now();
            result = await uploadVideo(req.file.path);
            console.log(`Cloudinary Video Upload Completed in ${(Date.now() - startTime) / 1000}s`);
            videoUrl = result.secure_url;
        } else {
            return res.status(400).json({ message: 'Invalid file type' });
        }

        // Create post
        const post = await Post.create({
            user: req.user._id,
            videoUrl: videoUrl || undefined,
            imageUrl: imageUrl || undefined,
            caption: caption || '',
        });

        // Delete local file
        fs.unlinkSync(req.file.path);

        // Populate user info
        await post.populate('user', 'username profilePic');

        res.status(201).json(post);
    } catch (error) {
        console.error('Create post error:', error);
        // Clean up file if upload fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get feed (all posts with pagination)
 * @route   GET /api/posts/feed?page=1&limit=10
 * @access  Private
 */
export const getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profilePic')
            .populate('comments.user', 'username profilePic')
            .populate('comments.replies.user', 'username profilePic');

        const total = await Post.countDocuments();

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total,
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get single post
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'username profilePic')
            .populate('comments.user', 'username profilePic')
            .populate('comments.replies.user', 'username profilePic');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Like/Unlike a post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
export const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const isLiked = post.likes.includes(req.user._id);

        if (isLiked) {
            // Unlike
            post.likes = post.likes.filter(
                (id) => id.toString() !== req.user._id.toString()
            );
        } else {
            // Like
            post.likes.push(req.user._id);

            // Create notification (only if liking own post is not the case)
            if (post.user.toString() !== req.user._id.toString()) {
                await Notification.create({
                    user: post.user,
                    type: 'like',
                    relatedUser: req.user._id,
                    post: post._id,
                });
            }
        }

        await post.save();

        res.json({
            liked: !isLiked,
            likesCount: post.likes.length,
        });
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Add comment to post
 * @route   POST /api/posts/:id/comment
 * @access  Private
 */
export const addComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = {
            user: req.user._id,
            text,
        };

        post.comments.push(comment);
        await post.save();

        // Populate the new comment
        await post.populate('comments.user', 'username profilePic');

        // Create notification (only if commenting on someone else's post)
        if (post.user.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: post.user,
                type: 'comment',
                relatedUser: req.user._id,
                post: post._id,
            });
        }

        res.status(201).json(post.comments[post.comments.length - 1]);
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Reply to a comment
 * @route   POST /api/posts/:id/comment/:commentId/reply
 * @access  Private
 */
export const replyToComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { id, commentId } = req.params;

        if (!text) {
            return res.status(400).json({ message: 'Reply text is required' });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const newReply = {
            user: req.user._id,
            text,
            createdAt: new Date()
        };

        comment.replies.push(newReply);
        await post.save();

        // Populate user info for the new reply
        await post.populate('comments.replies.user', 'username profilePic');

        // Access the specific reply we just added
        const addedReply = comment.replies[comment.replies.length - 1];

        // Create notification
        if (comment.user.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: comment.user, // Notify the original commenter
                type: 'reply', // specific type for reply
                relatedUser: req.user._id,
                post: post._id,
            });
        }

        res.status(201).json(addedReply);
    } catch (error) {
        console.error('Reply comment error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the post owner
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: error.message });
    }
};

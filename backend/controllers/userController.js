import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { uploadImage } from '../config/cloudinary.js';
import fs from 'fs';

/**
 * @desc    Get user profile
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'username profilePic')
            .populate('following', 'username profilePic');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's posts
        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePic');

        res.json({
            user,
            posts,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            postsCount: posts.length,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
    try {
        console.log('Update profile headers:', req.headers['content-type']);
        const { username, bio } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (username) user.username = username;
        if (bio !== undefined) user.bio = bio;

        // Handle profile picture upload
        if (req.file) {
            console.log('Uploading profile pic to Cloudinary:', req.file.path);
            const result = await uploadImage(req.file.path);
            console.log('Cloudinary upload success:', result.secure_url);
            user.profilePic = result.secure_url;
            // Delete local file
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error("Error deleting file", err);
            }
        } else {
            console.log('No profile pic file in request');
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            profilePic: updatedUser.profilePic,
            bio: updatedUser.bio,
            followers: updatedUser.followers,
            following: updatedUser.following,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Follow a user
 * @route   POST /api/users/follow/:id
 * @access  Private
 */
export const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already following
        if (currentUser.following.includes(userToFollow._id)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Add to following and followers
        currentUser.following.push(userToFollow._id);
        userToFollow.followers.push(currentUser._id);

        await currentUser.save();
        await userToFollow.save();

        // Create notification
        await Notification.create({
            user: userToFollow._id,
            type: 'follow',
            relatedUser: currentUser._id,
        });

        res.json({ message: 'User followed successfully' });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Unfollow a user
 * @route   POST /api/users/unfollow/:id
 * @access  Private
 */
export const unfollowUser = async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if not following
        if (!currentUser.following.includes(userToUnfollow._id)) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        // Remove from following and followers
        currentUser.following = currentUser.following.filter(
            (id) => id.toString() !== userToUnfollow._id.toString()
        );
        userToUnfollow.followers = userToUnfollow.followers.filter(
            (id) => id.toString() !== currentUser._id.toString()
        );

        await currentUser.save();
        await userToUnfollow.save();

        res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Search users
 * @route   GET /api/users/search?q=query
 * @access  Private
 */
export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
            ],
        })
            .select('-password')
            .limit(20);

        res.json(users);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
};

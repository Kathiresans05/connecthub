import express from 'express';
import {
    getUserProfile,
    updateProfile,
    followUser,
    unfollowUser,
    searchUsers,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/search', protect, searchUsers);
router.get('/:id', getUserProfile);
router.put('/profile', protect, uploadImage.single('profilePic'), updateProfile);
router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);

export default router;

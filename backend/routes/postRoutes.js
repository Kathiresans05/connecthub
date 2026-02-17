import express from 'express';
import {
    createPost,
    getFeed,
    getPost,
    toggleLike,
    addComment,
    replyToComment,
    deletePost,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected
router.post('/', protect, uploadMedia.single('media'), createPost);
router.get('/feed', protect, getFeed);
router.get('/:id', getPost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.post('/:id/comment/:commentId/reply', protect, replyToComment);
router.delete('/:id', protect, deletePost);

export default router;

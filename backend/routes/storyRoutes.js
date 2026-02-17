import express from 'express';
import { createStory, getStoriesFlow } from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, uploadMedia.single('media'), createStory);
router.get('/feed', protect, getStoriesFlow);

export default router;

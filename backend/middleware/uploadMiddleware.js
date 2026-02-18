import multer from 'multer';
import path from 'path';
import os from 'os';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use system temp directory in production/Vercel (read-only filesystem workaround)
        // Otherwise use local uploads directory
        const uploadPath = (process.env.NODE_ENV === 'production' || process.env.VERCEL)
            ? os.tmpdir()
            : 'uploads/';
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter for videos
const videoFilter = (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only video files are allowed (mp4, mov, avi, mkv, webm)'));
    }
};

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// File filter for both images and videos
const mediaFilter = (req, file, cb) => {
    console.log('Processing file:', file.originalname, 'Mimetype:', file.mimetype);
    const allowedTypes = /jpeg|jpg|png|gif|webp|jfif|mp4|mov|avi|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        console.error('File rejected:', file.originalname, 'Mimetype:', file.mimetype);
        cb(new Error('Only image and video files are allowed'));
    }
};

// Multer middleware for video upload
export const uploadVideo = multer({
    storage,
    fileFilter: videoFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Multer middleware for image upload
export const uploadImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Multer middleware for any media upload
export const uploadMedia = multer({
    storage,
    fileFilter: mediaFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit (max for video)
});

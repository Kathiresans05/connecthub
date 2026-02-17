import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure Cloudinary for video storage
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload video to Cloudinary
 * @param {String} filePath - Path to the video file
 * @returns {Promise} - Cloudinary upload result
 */
export const uploadVideo = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video',
            folder: 'connecthub/videos',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 720, crop: 'limit' }
            ],
        });
        return result;
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Path to the image file
 * @returns {Promise} - Cloudinary upload result
 */
export const uploadImage = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'image',
            folder: 'connecthub/images',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 500, height: 500, crop: 'fill' }
            ],
        });
        return result;
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

export default cloudinary;

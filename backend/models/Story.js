import mongoose from 'mongoose';

const storySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        mediaUrl: {
            type: String,
            required: true,
        },
        mediaType: {
            type: String,
            enum: ['image', 'video'],
            default: 'image',
        },
        viewers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 86400, // Expires in 24 hours (24 * 60 * 60 seconds)
        },
    },
    {
        timestamps: true,
    }
);

const Story = mongoose.model('Story', storySchema);

export default Story;

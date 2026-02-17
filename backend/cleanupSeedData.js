import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

const cleanupSeedData = async () => {
    try {
        // defined demo users
        const sampleUserEmails = [
            'sarah@example.com',
            'john@example.com',
            'emma@example.com',
            'mike@example.com'
        ];

        // Find demo users to get their IDs
        const demoUsers = await User.find({ email: { $in: sampleUserEmails } });
        const demoUserIds = demoUsers.map(user => user._id);

        if (demoUserIds.length === 0) {
            console.log('⚠️  No demo users found to delete.');
            return;
        }

        console.log(`Found ${demoUserIds.length} demo users.`);

        // Delete posts by demo users
        const deletedPosts = await Post.deleteMany({ user: { $in: demoUserIds } });
        console.log(`🗑️  Deleted ${deletedPosts.deletedCount} posts from demo users`);

        // Delete messages involving demo users
        const deletedMessages = await Message.deleteMany({
            $or: [
                { sender: { $in: demoUserIds } },
                { receiver: { $in: demoUserIds } }
            ]
        });
        console.log(`🗑️  Deleted ${deletedMessages.deletedCount} messages involving demo users`);

        // Delete notifications involving demo users
        const deletedNotifications = await Notification.deleteMany({
            $or: [
                { user: { $in: demoUserIds } },
                { relatedUser: { $in: demoUserIds } }
            ]
        });
        console.log(`🗑️  Deleted ${deletedNotifications.deletedCount} notifications involving demo users`);

        // Delete the users themselves
        const deletedUsers = await User.deleteMany({ _id: { $in: demoUserIds } });
        console.log(`🗑️  Deleted ${deletedUsers.deletedCount} demo users`);

        console.log('\n✅ Cleanup completed!');


    } catch (error) {
        console.error('❌ Error cleaning up data:', error);
    } finally {
        mongoose.connection.close();
        console.log('👋 Database connection closed');
    }
};

// Run cleanup
connectDB().then(() => cleanupSeedData());

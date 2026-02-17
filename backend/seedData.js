import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';

dotenv.config();

// Sample video URLs from public sources (for demo)
const sampleVideos = [
    'https://res.cloudinary.com/demo/video/upload/v1689587200/samples/sea-turtle.mp4',
    'https://res.cloudinary.com/demo/video/upload/v1689587200/samples/elephants.mp4',
    'https://res.cloudinary.com/demo/video/upload/v1689587200/samples/cld-sample-video.mp4',
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Post.deleteMany({});
        await Message.deleteMany({});
        await Notification.deleteMany({});

        console.log('🗑️  Cleared existing data');

        // Create sample users
        const password = await bcrypt.hash('password123', 10);

        const users = await User.create([
            {
                username: 'sarah_wilson',
                email: 'sarah@example.com',
                password,
                bio: 'Travel enthusiast 🌍 | Food lover 🍕',
                profilePic: 'https://i.pravatar.cc/150?img=5',
            },
            {
                username: 'john_doe',
                email: 'john@example.com',
                password,
                bio: 'Tech geek 💻 | Coffee addict ☕',
                profilePic: 'https://i.pravatar.cc/150?img=12',
            },
            {
                username: 'emma_davis',
                email: 'emma@example.com',
                password,
                bio: 'Fitness coach 💪 | Yoga instructor 🧘',
                profilePic: 'https://i.pravatar.cc/150?img=9',
            },
            {
                username: 'mike_johnson',
                email: 'mike@example.com',
                password,
                bio: 'Photographer 📸 | Nature lover 🌲',
                profilePic: 'https://i.pravatar.cc/150?img=15',
            },
        ]);

        console.log('✅ Created sample users');

        // Create follow relationships
        await User.findByIdAndUpdate(users[0]._id, {
            $push: { following: users[1]._id, followers: users[2]._id }
        });
        await User.findByIdAndUpdate(users[1]._id, {
            $push: { followers: users[0]._id, following: users[2]._id }
        });
        await User.findByIdAndUpdate(users[2]._id, {
            $push: { followers: users[1]._id, following: users[0]._id }
        });

        console.log('✅ Created follow relationships');

        // Create sample posts
        const posts = await Post.create([
            {
                user: users[0]._id,
                videoUrl: sampleVideos[0],
                caption: 'Amazing sunset by the beach! 🌅 #nature #beach #sunset',
                likes: [users[1]._id, users[2]._id],
                comments: [
                    {
                        user: users[1]._id,
                        text: 'Absolutely beautiful! 😍',
                    },
                    {
                        user: users[2]._id,
                        text: 'Love this! Where is this?',
                    },
                ],
            },
            {
                user: users[1]._id,
                videoUrl: sampleVideos[1],
                caption: 'Coding session vibes 💻✨ #coding #developer #tech',
                likes: [users[0]._id, users[3]._id],
                comments: [
                    {
                        user: users[0]._id,
                        text: 'Keep crushing it! 🔥',
                    },
                ],
            },
            {
                user: users[2]._id,
                videoUrl: sampleVideos[2],
                caption: 'Morning yoga flow 🧘‍♀️ #yoga #fitness #wellness',
                likes: [users[0]._id, users[1]._id, users[3]._id],
                comments: [
                    {
                        user: users[0]._id,
                        text: 'So peaceful! 🙏',
                    },
                    {
                        user: users[3]._id,
                        text: 'Need to try this routine!',
                    },
                ],
            },
            {
                user: users[3]._id,
                videoUrl: sampleVideos[0],
                caption: 'Captured this magical moment 📸 #photography #nature',
                likes: [users[1]._id, users[2]._id],
                comments: [],
            },
        ]);

        console.log('✅ Created sample posts');

        // Create sample messages
        await Message.create([
            {
                sender: users[0]._id,
                receiver: users[1]._id,
                text: 'Hey! How are you?',
            },
            {
                sender: users[1]._id,
                receiver: users[0]._id,
                text: 'Hey Sarah! I\'m good, thanks! How about you?',
            },
            {
                sender: users[0]._id,
                receiver: users[1]._id,
                text: 'Doing great! Love your latest post! 🔥',
            },
        ]);

        console.log('✅ Created sample messages');

        // Create sample notifications
        await Notification.create([
            {
                user: users[0]._id,
                type: 'like',
                relatedUser: users[1]._id,
                post: posts[0]._id,
            },
            {
                user: users[0]._id,
                type: 'comment',
                relatedUser: users[2]._id,
                post: posts[0]._id,
            },
            {
                user: users[1]._id,
                type: 'follow',
                relatedUser: users[0]._id,
            },
        ]);

        console.log('✅ Created sample notifications');

        console.log('\n🎉 Seed data created successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Posts: ${posts.length}`);
        console.log(`   Sample Credentials:`);
        console.log(`   - Email: sarah@example.com | Password: password123`);
        console.log(`   - Email: john@example.com | Password: password123`);
        console.log(`   - Email: emma@example.com | Password: password123`);
        console.log(`   - Email: mike@example.com | Password: password123`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
};

// Run seed
connectDB().then(() => seedData());

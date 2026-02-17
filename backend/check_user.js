
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({
            $or: [{ email: 'kathir07' }, { username: 'kathir07' }]
        });

        if (user) {
            console.log('User found:', {
                id: user._id,
                username: user.username,
                email: user.email,
                // password hash not useful to print, but confirms it exists
            });
        } else {
            console.log('User NOT found: kathir07');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUser();

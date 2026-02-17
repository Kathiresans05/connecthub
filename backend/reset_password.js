
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'kathir07@gmail.com'; // Based on previous check_user output
        const newPassword = 'password123';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const result = await User.findOneAndUpdate(
            { email: email },
            { password: hashedPassword },
            { new: true }
        );

        if (result) {
            console.log('Password reset successfully for:', result.username);
        } else {
            console.log('User not found.');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

resetPassword();

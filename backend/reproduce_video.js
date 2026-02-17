
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create a dummy video file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testVideoPath = path.join(__dirname, 'test_video.mp4');

// Create a dummy file (just random bytes, enough to pass size check but not too big)
const buffer = Buffer.alloc(1024 * 1024); // 1MB
fs.writeFileSync(testVideoPath, buffer);
console.log('Created test_video.mp4 (1MB)');

const testUpload = async () => {
    // 1. Login to get token
    const loginUrl = 'http://localhost:5000/api/auth/login';
    const loginPayload = {
        email: 'kathir07',
        password: 'password123'
    };

    let token;
    try {
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload)
        });
        const data = await response.json();
        if (response.ok) {
            token = data.token;
            console.log('Login successful');
        } else {
            console.error('Login failed:', data);
            return;
        }
    } catch (error) {
        console.error('Login error:', error);
        return;
    }

    // 2. Upload file
    const uploadUrl = 'http://localhost:5000/api/posts';
    const formData = new FormData();
    const blob = new Blob([fs.readFileSync(testVideoPath)], { type: 'video/mp4' });
    formData.append('media', blob, 'test_video.mp4');
    formData.append('caption', 'Test video upload from script');
    formData.append('type', 'video');

    console.log('Uploading video...');
    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        try {
            const data = JSON.parse(text);
            console.log('Response Body:', data);
        } catch (e) {
            console.log('Response Body (Text):', text);
        }
    } catch (error) {
        console.error('Upload Error:', error);
    }
};

testUpload();

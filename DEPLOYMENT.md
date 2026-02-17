# ConnectHub - Deployment Guide

This guide will walk you through deploying ConnectHub to production using:
- **Vercel** (Frontend)
- **Render** (Backend)
- **MongoDB Atlas** (Database)
- **Cloudinary** (Video Storage)

---

## 📋 Prerequisites

Before starting, create accounts on:
1. [Vercel](https://vercel.com/) - Frontend hosting
2. [Render](https://render.com/) - Backend hosting
3. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Database
4. [Cloudinary](https://cloudinary.com/) - Video storage

---

## 1️⃣ MongoDB Atlas Setup

### Step 1: Create a Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create an account
3. Click "Build a Database"
4. Choose **M0 Free** tier
5. Select a cloud provider and region (choose closest to your users)
6. Click "Create Cluster"

### Step 2: Create Database User
1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set "Database User Privileges" to "Read and write to any database"
6. Click "Add User"

### Step 3: Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 4: Get Connection String
1. Go to **Database** (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `connecthub`

**Example:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/connecthub?retryWrites=true&w=majority
```

---

## 2️⃣ Cloudinary Setup

### Step 1: Create Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Credentials
1. Go to **Dashboard**
2. Find your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Save these for later

### Optional: Configure Upload Presets
1. Go to **Settings** → **Upload**
2. Scroll to "Upload presets"
3. Create a preset for video optimization

---

## 3️⃣ Backend Deployment (Render)

### Step 1: Prepare Code
Ensure your backend has:
- `package.json` with all dependencies
- `server.js` as the entry point
- `.env.example` file

### Step 2: Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `connecthub-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables
Click "Advanced" → "Add Environment Variable" and add:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your_mongodb_atlas_connection_string>
JWT_SECRET=<generate_strong_random_string>
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
CLIENT_URL=<your_frontend_url_will_add_later>
```

**Note:** Leave `CLIENT_URL` empty for now, we'll update it after deploying frontend.

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete (5-10 minutes)
3. Copy the deployment URL (e.g., `https://connecthub-backend.onrender.com`)

---

## 4️⃣ Frontend Deployment (Vercel)

### Step 1: Prepare Code
Update `frontend/.env`:
```env
VITE_API_URL=<your_render_backend_url>/api
```

**Example:**
```env
VITE_API_URL=https://connecthub-backend.onrender.com/api
```

### Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables
In Vercel project settings:
1. Go to "Settings" → "Environment Variables"
2. Add:
   ```
   VITE_API_URL = https://connecthub-backend.onrender.com/api
   ```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Copy your Vercel URL (e.g., `https://connecthub.vercel.app`)

---

## 5️⃣ Update Backend CORS

### Step 1: Update Environment Variable
1. Go back to Render backend dashboard
2. Go to "Environment" tab
3. Update `CLIENT_URL`:
   ```
   CLIENT_URL=https://connecthub.vercel.app
   ```

### Step 2: Redeploy
1. Render will automatically redeploy
2. Wait for completion

---

## 6️⃣ Final Testing

### Test the Application
1. Visit your Vercel URL
2. Register a new account
3. Log in
4. Upload a test video
5. Test real-time chat
6. Verify all features work

### Common Issues

**Issue:** "Network Error" or "CORS Error"
- **Solution:** Ensure `CLIENT_URL` in backend matches your Vercel URL exactly

**Issue:** "Database connection failed"
- **Solution:** Check MongoDB Atlas connection string and network access

**Issue:** "Cloudinary upload failed"
- **Solution:** Verify Cloudinary credentials in backend environment variables

**Issue:** "Socket.io not connecting"
- **Solution:** Ensure backend URL is correct in frontend `.env`

---

## 7️⃣ Custom Domain (Optional)

### Setup Custom Domain on Vercel
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `CLIENT_URL` in Render backend

### Setup Custom Domain on Render
1. Go to Render service settings
2. Click "Custom Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `VITE_API_URL` in Vercel frontend

---

## 8️⃣ Monitoring & Maintenance

### Render Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- **Solution:** Upgrade to paid plan or use cron job to ping server

### Keep Server Awake (Optional)
Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 5 minutes.

### Monitor Logs
- **Render**: View logs in service dashboard
- **Vercel**: View logs in deployment details
- **MongoDB**: Monitor in Atlas dashboard

---

## 9️⃣ Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/connecthub
JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 🎉 Deployment Complete!

Your ConnectHub application is now live and production-ready!

### Next Steps
1. Share your app URL with friends
2. Monitor usage and performance
3. Implement analytics (Google Analytics, Mixpanel)
4. Set up error tracking (Sentry)
5. Add more features from the roadmap

---

## 📞 Support

If you encounter issues:
1. Check Render and Vercel logs
2. Verify all environment variables
3. Test MongoDB connection
4. Check Cloudinary dashboard

---

## 🔄 CI/CD

Both Vercel and Render support automatic deployments:
- **Vercel**: Deploys on every push to main branch
- **Render**: Deploys on every push to main branch

To disable auto-deploy, configure in respective platform settings.

---

**Happy Deploying! 🚀**

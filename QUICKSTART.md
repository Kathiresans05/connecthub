# ConnectHub - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### Step 2: Setup MongoDB

**Option A: Local MongoDB**
- Install MongoDB Community Edition
- Start MongoDB: `mongod`
- Default connection: `mongodb://localhost:27017/connecthub`

**Option B: MongoDB Atlas (Recommended)**
- Create free account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
- Create cluster → Get connection string
- Update `backend/.env` with your connection string

### Step 3: Setup Cloudinary

1. Create free account at [cloudinary.com](https://cloudinary.com/)
2. Get your credentials from Dashboard
3. Update `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Step 4: Configure Environment

**Backend** (`backend/.env` is already created, just update Cloudinary):
```env
MONGODB_URI=mongodb://localhost:27017/connecthub
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend** (`.env` is already set up):
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 6: Access Application

Open browser: **http://localhost:5173**

---

## ✅ First Time Setup Checklist

- [ ] Install Node.js (v16+)
- [ ] Install MongoDB OR create MongoDB Atlas account
- [ ] Create Cloudinary account
- [ ] Run `npm install` in both backend and frontend
- [ ] Update `.env` files with credentials
- [ ] Start both servers
- [ ] Register first user
- [ ] Upload test video

---

## 🎯 Test Features

1. **Register** → Create account
2. **Upload** → Upload a video
3. **Home** → View video feed
4. **Profile** → Check your profile
5. **Chat** → Send messages
6. **Like/Comment** → Interact with posts

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB connection
- Verify `.env` file exists

**Video upload fails:**
- Verify Cloudinary credentials
- Check file size (< 100MB)

**Frontend can't connect:**
- Ensure backend is running
- Check `VITE_API_URL` in frontend `.env`

---

## 📚 Documentation

- [README.md](./README.md) - Full documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference

---

**Need help?** Check the full documentation or create an issue!

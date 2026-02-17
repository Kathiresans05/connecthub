# ConnectHub - Social Media Platform

<div align="center">
  <h3>🎥 A modern social media platform for sharing short videos</h3>
  <p>Similar to Instagram Reels / YouTube Shorts with real-time chat</p>
</div>

---

## ✨ Features

### 🔐 Authentication System
- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes and middleware

### 👤 User Profile
- View and edit profile
- Profile picture upload
- Custom bio
- Follow/Unfollow users
- Followers and Following count
- User posts grid

### 📹 Video Posts (Shorts)
- Upload short videos (up to 100MB)
- Cloudinary video storage
- Caption and hashtags support
- Auto-play videos in feed
- Infinite scroll
- Like/Unlike posts
- Comment system
- Delete post (owner only)
- Share functionality

### 💬 Real-time Chat
- One-to-one messaging
- Socket.io integration
- Online/Offline status indicators
- Real-time message delivery
- Conversation list
- Message timestamps

### 🔔 Notifications System
- Like notifications
- Follow notifications
- Comment notifications
- Unread count badge

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling (dark theme)
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Video storage
- **Socket.io** - Real-time features
- **CORS** - Cross-origin requests

---

## 📁 Project Structure

```
connect1/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   ├── db.js               # MongoDB connection
│   │   └── socket.js           # Socket.io setup
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── userController.js   # User operations
│   │   ├── postController.js   # Post CRUD operations
│   │   ├── messageController.js # Chat functionality
│   │   └── notificationController.js # Notifications
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── errorHandler.js     # Error handling
│   │   └── uploadMiddleware.js # File upload config
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Post.js             # Post schema
│   │   ├── Message.js          # Message schema
│   │   └── Notification.js     # Notification schema
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── userRoutes.js       # User endpoints
│   │   ├── postRoutes.js       # Post endpoints
│   │   ├── messageRoutes.js    # Chat endpoints
│   │   └── notificationRoutes.js # Notification endpoints
│   ├── uploads/                # Temporary file storage
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── server.js               # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx      # Top navigation
    │   │   ├── BottomNav.jsx   # Mobile bottom nav
    │   │   ├── VideoCard.jsx   # Video player component
    │   │   └── ProtectedRoute.jsx # Route protection
    │   ├── context/
    │   │   ├── AuthContext.jsx # Auth state management
    │   │   └── SocketContext.jsx # Socket.io state
    │   ├── pages/
    │   │   ├── Login.jsx       # Login page
    │   │   ├── Register.jsx    # Registration page
    │   │   ├── Home.jsx        # Video feed (Shorts)
    │   │   ├── Feed.jsx        # Instagram-style feed
    │   │   ├── Profile.jsx     # User profile
    │   │   ├── Upload.jsx      # Video upload
    │   │   └── Chat.jsx        # Messaging
    │   ├── utils/
    │   │   └── api.js          # Axios configuration
    │   ├── App.jsx             # Main app component
    │   ├── main.jsx            # Entry point
    │   └── index.css           # Global styles
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── index.html
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for video storage)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd connect1
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/connecthub
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

**Start the backend:**
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
```

**Start the frontend:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

---

## 📡 API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

---

## 🎨 UI Design

The application features a modern dark theme inspired by popular short-video platforms:

- **Dark Background**: `#0F1419`
- **Secondary**: `#1A1F2E`
- **Primary Blue**: `#5B7FFF`
- **Accent Pink**: `#FF4D6D`
- **Inter Font Family**

### Key UI Features
- Responsive design (mobile-first)
- Bottom navigation for mobile
- Top navbar with tabs
- Infinite scroll video feed
- Auto-playing videos
- Smooth animations and transitions
- Glass-morphism effects

---

## 🔧 Environment Variables

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/connecthub` |
| `JWT_SECRET` | Secret key for JWT | `your_secret_key` |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## 📱 Features Walkthrough

### 1. Authentication
- Users can register with username, email, and password
- Login with email and password
- JWT tokens stored in localStorage
- Auto-redirect on authentication

### 2. Home Feed (Shorts)
- Vertical scroll through videos
- Auto-play videos when in view
- Tap to pause/play
- Like, comment, share, save actions
- View user profiles

### 3. Feed Page
- Instagram-style post layout
- Like and comment on posts
- View full captions
- Navigate to user profiles

### 4. Profile
- View user information
- Follow/Unfollow users
- See posts in grid layout
- Edit own profile

### 5. Upload
- Select video from device
- Preview before upload
- Add caption and hashtags
- Upload progress indicator
- Cloudinary storage

### 6. Chat
- Real-time messaging
- Online/Offline status
- Conversation list
- Message timestamps
- Socket.io powered

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary

---

## 🔮 Future Improvements

1. **Search Functionality**
   - Search users by username
   - Search posts by hashtags
   - Trending hashtags

2. **Enhanced Features**
   - Video filters and effects
   - Story feature (24h expiry)
   - Saved posts collection
   - Share to external platforms

3. **Social Features**
   - Tag users in posts
   - Mention users in comments
   - Reply to comments
   - Direct message groups

4. **Analytics**
   - View counts
   - Engagement metrics
   - Profile insights

5. **Performance**
   - Video compression
   - Lazy loading
   - CDN integration
   - Caching strategies

6. **Moderation**
   - Report posts/users
   - Content moderation
   - Block users
   - Privacy settings

7. **Monetization**
   - Ad integration
   - Creator fund
   - Sponsored posts

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## 👨‍💻 Author

Built with ❤️ using React, Node.js, and MongoDB

---

## 📞 Support

For support, email support@connecthub.com or join our community discord.

---

**Happy Coding! 🎉**

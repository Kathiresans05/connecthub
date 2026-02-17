# ConnectHub - API Documentation

Complete REST API documentation for ConnectHub backend.

**Base URL:** `http://localhost:5000/api` (Development)  
**Production:** `https://your-backend.onrender.com/api`

---

## 📑 Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Posts](#posts)
4. [Messages](#messages)
5. [Notifications](#notifications)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`  
**Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
  "username": "johndoe",
  "email": "john@example.com",
  "profilePic": "https://res.cloudinary.com/...",
  "bio": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - User already exists
- `400` - Missing required fields
- `500` - Server error

---

### Login

Authenticate and get JWT token.

**Endpoint:** `POST /auth/login`  
**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
  "username": "johndoe",
  "email": "john@example.com",
  "profilePic": "https://res.cloudinary.com/...",
  "bio": "Hey there! I am using ConnectHub",
  "followers": ["64f5a1b2c3d4e5f6a7b8c9d1"],
  "following": ["64f5a1b2c3d4e5f6a7b8c9d2"],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Invalid credentials
- `400` - Missing fields
- `500` - Server error

---

### Verify Token

Verify if JWT token is valid.

**Endpoint:** `GET /auth/verify`  
**Access:** Private

**Response (200):**
```json
{
  "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
  "username": "johndoe",
  "email": "john@example.com",
  "profilePic": "https://res.cloudinary.com/...",
  "bio": "Hey there!",
  "followers": [],
  "following": []
}
```

---

## 👤 Users

### Get User Profile

Get user profile and posts.

**Endpoint:** `GET /users/:id`  
**Access:** Public

**Response (200):**
```json
{
  "user": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "profilePic": "https://res.cloudinary.com/...",
    "bio": "Hey there!",
    "followers": [],
    "following": []
  },
  "posts": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d3",
      "user": "64f5a1b2c3d4e5f6a7b8c9d0",
      "videoUrl": "https://res.cloudinary.com/...",
      "caption": "My first video! #connecthub",
      "likes": [],
      "comments": [],
      "createdAt": "2024-02-14T10:30:00.000Z"
    }
  ],
  "followersCount": 120,
  "followingCount": 85,
  "postsCount": 15
}
```

**Errors:**
- `404` - User not found

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /users/profile`  
**Access:** Private

**Request (multipart/form-data):**
```
username: johndoe_updated
bio: New bio text
profilePic: [file]
```

**Response (200):**
```json
{
  "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
  "username": "johndoe_updated",
  "email": "john@example.com",
  "profilePic": "https://res.cloudinary.com/...",
  "bio": "New bio text",
  "followers": [],
  "following": []
}
```

---

### Follow User

Follow another user.

**Endpoint:** `POST /users/follow/:id`  
**Access:** Private

**Response (200):**
```json
{
  "message": "User followed successfully"
}
```

**Errors:**
- `404` - User not found
- `400` - Already following

---

### Unfollow User

Unfollow a user.

**Endpoint:** `POST /users/unfollow/:id`  
**Access:** Private

**Response (200):**
```json
{
  "message": "User unfollowed successfully"
}
```

**Errors:**
- `404` - User not found
- `400` - Not following this user

---

### Search Users

Search for users by username or email.

**Endpoint:** `GET /users/search?q=john`  
**Access:** Private

**Response (200):**
```json
[
  {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "profilePic": "https://res.cloudinary.com/...",
    "bio": "Hey there!"
  }
]
```

---

## 📹 Posts

### Create Post

Upload a new video post.

**Endpoint:** `POST /posts`  
**Access:** Private

**Request (multipart/form-data):**
```
video: [video file - max 100MB]
caption: My awesome video! #fun #connecthub
```

**Response (201):**
```json
{
  "_id": "64f5a1b2c3d4e5f6a7b8c9d3",
  "user": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "profilePic": "https://res.cloudinary.com/..."
  },
  "videoUrl": "https://res.cloudinary.com/...",
  "caption": "My awesome video! #fun #connecthub",
  "likes": [],
  "comments": [],
  "createdAt": "2024-02-14T10:30:00.000Z"
}
```

**Errors:**
- `400` - No video file
- `500` - Upload failed

---

### Get Feed

Get paginated feed of all posts.

**Endpoint:** `GET /posts/feed?page=1&limit=10`  
**Access:** Private

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response (200):**
```json
{
  "posts": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d3",
      "user": {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
        "username": "johndoe",
        "profilePic": "https://res.cloudinary.com/..."
      },
      "videoUrl": "https://res.cloudinary.com/...",
      "caption": "Amazing sunset! #nature",
      "likes": ["64f5a1b2c3d4e5f6a7b8c9d1"],
      "comments": [],
      "createdAt": "2024-02-14T10:30:00.000Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalPosts": 47
}
```

---

### Get Single Post

Get details of a specific post.

**Endpoint:** `GET /posts/:id`  
**Access:** Public

**Response (200):**
```json
{
  "_id": "64f5a1b2c3d4e5f6a7b8c9d3",
  "user": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "profilePic": "https://res.cloudinary.com/..."
  },
  "videoUrl": "https://res.cloudinary.com/...",
  "caption": "Great video!",
  "likes": ["64f5a1b2c3d4e5f6a7b8c9d1"],
  "comments": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d4",
      "user": {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
        "username": "janedoe",
        "profilePic": "https://res.cloudinary.com/..."
      },
      "text": "Love this!",
      "createdAt": "2024-02-14T11:00:00.000Z"
    }
  ],
  "createdAt": "2024-02-14T10:30:00.000Z"
}
```

---

### Like/Unlike Post

Toggle like on a post.

**Endpoint:** `POST /posts/:id/like`  
**Access:** Private

**Response (200):**
```json
{
  "liked": true,
  "likesCount": 15
}
```

---

### Add Comment

Add a comment to a post.

**Endpoint:** `POST /posts/:id/comment`  
**Access:** Private

**Request Body:**
```json
{
  "text": "Great video!"
}
```

**Response (201):**
```json
{
  "_id": "64f5a1b2c3d4e5f6a7b8c9d4",
  "user": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "profilePic": "https://res.cloudinary.com/..."
  },
  "text": "Great video!",
  "createdAt": "2024-02-14T11:00:00.000Z"
}
```

---

### Delete Post

Delete a post (owner only).

**Endpoint:** `DELETE /posts/:id`  
**Access:** Private

**Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

**Errors:**
- `404` - Post not found
- `403` - Not authorized

---

## 💬 Messages

### Send Message

Send a message to another user.

**Endpoint:** `POST /messages`  
**Access:** Private

**Request Body:**
```json
{
  "receiver": "64f5a1b2c3d4e5f6a7b8c9d1",
  "text": "Hey, how are you?"
}
```

**Response (201):**
```json
{
  "_id": "64f5a1b2c3d4e5f6a7b8c9d5",
  "sender": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "profilePic": "https://res.cloudinary.com/..."
  },
  "receiver": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "username": "janedoe",
    "profilePic": "https://res.cloudinary.com/..."
  },
  "text": "Hey, how are you?",
  "createdAt": "2024-02-14T12:00:00.000Z"
}
```

---

### Get Conversations

Get all conversations for the current user.

**Endpoint:** `GET /messages/conversations`  
**Access:** Private

**Response (200):**
```json
[
  {
    "user": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "username": "janedoe",
      "profilePic": "https://res.cloudinary.com/..."
    },
    "lastMessage": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d5",
      "text": "Hey, how are you?",
      "createdAt": "2024-02-14T12:00:00.000Z"
    }
  }
]
```

---

### Get Messages

Get all messages with a specific user.

**Endpoint:** `GET /messages/:userId`  
**Access:** Private

**Response (200):**
```json
[
  {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d5",
    "sender": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "username": "johndoe",
      "profilePic": "https://res.cloudinary.com/..."
    },
    "receiver": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "username": "janedoe",
      "profilePic": "https://res.cloudinary.com/..."
    },
    "text": "Hey!",
    "createdAt": "2024-02-14T12:00:00.000Z"
  }
]
```

---

## 🔔 Notifications

### Get Notifications

Get all notifications for the current user.

**Endpoint:** `GET /notifications`  
**Access:** Private

**Response (200):**
```json
[
  {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d6",
    "user": "64f5a1b2c3d4e5f6a7b8c9d0",
    "type": "like",
    "relatedUser": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "username": "janedoe",
      "profilePic": "https://res.cloudinary.com/..."
    },
    "post": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d3",
      "videoUrl": "https://res.cloudinary.com/..."
    },
    "isRead": false,
    "createdAt": "2024-02-14T12:00:00.000Z"
  }
]
```

---

### Mark as Read

Mark a notification as read.

**Endpoint:** `PUT /notifications/:id/read`  
**Access:** Private

**Response (200):**
```json
{
  "_id": "64f5a1b2c3d4e5f6a7b8c9d6",
  "isRead": true
}
```

---

### Mark All as Read

Mark all notifications as read.

**Endpoint:** `PUT /notifications/read-all`  
**Access:** Private

**Response (200):**
```json
{
  "message": "All notifications marked as read"
}
```

---

### Get Unread Count

Get count of unread notifications.

**Endpoint:** `GET /notifications/unread-count`  
**Access:** Private

**Response (200):**
```json
{
  "count": 5
}
```

---

## 🔌 Socket.io Events

### Client → Server

**`user-online`**
```javascript
socket.emit('user-online', userId);
```

**`send-message`**
```javascript
socket.emit('send-message', {
  receiverId: '64f5a1b2c3d4e5f6a7b8c9d1',
  message: messageObject
});
```

**`typing`**
```javascript
socket.emit('typing', {
  senderId: '64f5a1b2c3d4e5f6a7b8c9d0',
  receiverId: '64f5a1b2c3d4e5f6a7b8c9d1',
  isTyping: true
});
```

### Server → Client

**`user-status`**
```javascript
socket.on('user-status', ({ userId, status }) => {
  // status: 'online' or 'offline'
});
```

**`receive-message`**
```javascript
socket.on('receive-message', (message) => {
  // New message object
});
```

**`user-typing`**
```javascript
socket.on('user-typing', ({ userId, isTyping }) => {
  // Show typing indicator
});
```

---

## ⚠️ Error Handling

All endpoints return errors in this format:

```json
{
  "message": "Error description",
  "stack": "Error stack trace (development only)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens expire in 7 days
- CORS enabled for specified client URL
- File upload size limits enforced
- Input validation on all endpoints

---

**API Version:** 1.0  
**Last Updated:** February 2024

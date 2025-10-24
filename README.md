# 🚀 Real-Time Chat Application with Socket.io

A modern, full-featured real-time chat application built with Socket.io, React, and Express. This application demonstrates bidirectional communication between clients and server with advanced chat features.

![Chat Application](https://via.placeholder.com/800x400/007bff/ffffff?text=Socket.io+Chat+App)

## ✨ Features

### 🎯 Core Features
- **Real-time messaging** using Socket.io
- **User authentication** with username-based login
- **Online user presence** with live user list
- **Message history** with automatic loading of recent messages
- **Typing indicators** showing when users are composing messages
- **Private messaging** between users
- **Connection status** indicator

### 🚀 Advanced Features
- **Multiple Chat Rooms** - Switch between General, Random, Tech Talk, and Announcements
- **Custom Room Creation** - Create your own chat rooms on demand
- **Message reactions** with emoji support (👍, ❤️, 😂, 😮, 😢, 😡)
- **File sharing** - Upload and share images, text files, and PDFs (max 5MB)
- **Read receipts** - See when your messages have been read
- **Message search** - Search through chat history by content or sender
- **Browser notifications** for new messages (with permission)
- **Sound notifications** for incoming messages
- **Message delivery acknowledgment** - Confirm message delivery
- **Unread message count** when tab is not active
- **Message persistence** across server restarts
- **Auto-reconnection** on connection loss
- **Responsive design** for mobile and desktop
- **Character limit** for messages (500 characters)
- **Username validation** (2-20 characters)
- **Message timestamps** with formatted display

## 🛠️ Technical Stack

### Frontend
- **React** (18.2.0) - UI library
- **Vite** - Fast build tool and dev server
- **Socket.io Client** (4.7.2) - Real-time communication
- **CSS3** - Styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express** (4.18.2) - Web framework
- **Socket.io Server** (4.7.2) - WebSocket server
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
socketio-chat/
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   │   ├── ChatRoom.jsx    # Main chat interface
│   │   │   ├── Login.jsx       # User authentication
│   │   │   ├── MessageList.jsx # Message display with reactions
│   │   │   ├── MessageInput.jsx# Message composition
│   │   │   ├── UserList.jsx    # Online users sidebar
│   │   │   └── TypingIndicator.jsx # Typing status
│   │   ├── context/        # React context providers
│   │   │   ├── SocketContext.jsx # Socket.io context
│   │   │   └── ChatContext.jsx   # Chat state management
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useChat.js       # Chat functionality hook
│   │   ├── pages/          # Page components
│   │   │   └── ChatPage.jsx     # Main chat page
│   │   ├── socket/         # Socket.io client setup
│   │   │   └── socket.js        # Socket client configuration
│   │   ├── App.jsx         # Main application component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Client dependencies
├── server/                 # Node.js back-end
│   ├── config/             # Configuration files
│   │   └── database.js     # MongoDB configuration
│   ├── controllers/        # Socket event handlers
│   │   └── chatController.js # Chat logic controller
│   ├── models/             # Data models
│   │   ├── User.js         # User model
│   │   ├── Message.js      # Message model
│   │   └── Room.js         # Room model
│   ├── socket/             # Socket.io server setup
│   │   └── socketHandler.js # Socket event handling
│   ├── utils/              # Utility functions
│   │   └── helpers.js      # Helper functions
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- MongoDB (local installation or MongoDB Atlas)
- MongoDB Compass (optional, for GUI database management)

### Database Setup (MongoDB)

#### Option 1: Local MongoDB Installation
1. Install MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb/brew/mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create new cluster
3. Get connection string from "Connect" → "Connect your application"
4. Use connection string in environment variables

#### Install MongoDB Compass (Optional)
1. Download from https://www.mongodb.com/try/download/compass
2. Connect to your MongoDB instance using connection string
3. Use for visual database management and monitoring

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd real-time-communication-with-socket-io-Magwaza51
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**
   
   Server `.env` file (server/.env):
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/socketio-chat
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/socketio-chat
   
   # Optional: Set to 'memory' to use in-memory storage instead of MongoDB
   # STORAGE_MODE=memory
   ```
   
   Client `.env` file (client/.env):
   ```env
   VITE_SOCKET_URL=http://localhost:5000
   ```

5. **Start the development servers**
   
   **Terminal 1 - Start the server:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Start the client:**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - Enter a username to join the chat

## 🎮 How to Use

### Getting Started
1. **Enter Username**: Type a username (2-20 characters) and click "Join Chat"
2. **Send Messages**: Type in the message input and press Enter or click Send
3. **Private Messages**: Click on any user in the sidebar to start a private conversation
4. **React to Messages**: Hover over any message and click the emoji button to add reactions
5. **View Online Users**: Check the sidebar to see who's currently online

### Features Walkthrough

#### 💬 Public Chat
- All messages sent in the general room are visible to all users
- Messages show sender name and timestamp
- System messages announce when users join/leave

#### 🔒 Private Messaging
- Click any username in the sidebar to start a private conversation
- Private messages are marked with a "Private" label
- Only you and the recipient can see private messages
- Switch back to public chat by clicking "# General"

#### 😊 Message Reactions
- Hover over any message to see the reaction button
- Click to choose from 6 different emoji reactions
- See who reacted by hovering over reaction badges
- Click reaction badges to add/remove your own reaction

#### 🔔 Notifications
- Browser notifications for new messages (requires permission)
- Sound notifications for incoming messages
- Unread count when tab is not active
- Visual connection status indicator

#### ⌨️ Typing Indicators
- See when other users are typing in real-time
- Automatically stops showing after 1 second of inactivity
- Shows multiple users typing simultaneously

## 🎯 Assignment Requirements Fulfilled

### ✅ Task 1: Project Setup
- ✅ Node.js server with Express
- ✅ Socket.io server configuration
- ✅ React front-end application
- ✅ Socket.io client setup
- ✅ Basic client-server connection

### ✅ Task 2: Core Chat Functionality
- ✅ Username-based authentication
- ✅ Global chat room for all users
- ✅ Messages with sender name and timestamp
- ✅ Typing indicators
- ✅ Online/offline status for users

### ✅ Task 3: Advanced Chat Features
- ✅ Private messaging between users
- ✅ **Multiple chat rooms** (General, Random, Tech Talk, Announcements + custom)
- ✅ "User is typing" indicator
- ✅ **File and image sharing** (images, text, PDF up to 5MB)
- ✅ **Read receipts** for messages
- ✅ Message reactions (like, love, etc.)

### ✅ Task 4: Real-Time Notifications
- ✅ New message notifications
- ✅ User join/leave notifications
- ✅ Unread message count
- ✅ Sound notifications
- ✅ Browser notifications (Web Notifications API)

### ✅ Task 5: Performance and UX Optimization
- ✅ **Message history loading** (last 20 messages per room)
- ✅ Reconnection logic for disconnections
- ✅ **Socket.io optimization** (using rooms for chat separation)
- ✅ **Message delivery acknowledgment**
- ✅ **Message search functionality**
- ✅ Responsive design for mobile and desktop

## 🔧 API Endpoints

### REST Endpoints
- `GET /` - Server status
- `GET /api/messages` - Retrieve message history
- `GET /api/users` - Get online users

### Socket Events

#### Client → Server
- `user_join` - User joins the chat
- `send_message` - Send a public message
- `private_message` - Send a private message
- `typing` - Update typing status
- `toggle_reaction` - Add/remove message reaction

#### Server → Client
- `user_list` - Updated list of online users
- `user_joined` - User joined notification
- `user_left` - User left notification
- `receive_message` - New public message
- `private_message` - New private message
- `message_history` - Historical messages on join
- `typing_users` - List of currently typing users
- `message_reaction_updated` - Updated message reactions

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface with smooth animations
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Dark Theme**: Eye-friendly color scheme
- **Visual Feedback**: Clear connection status, typing indicators, and notifications
- **Accessibility**: Keyboard navigation support and clear visual hierarchy

## 🚀 Deployment Options

### Recommended Platforms

#### Frontend (Client)
- **Vercel** - Automatic deployments from Git
- **Netlify** - Easy drag-and-drop deployment
- **GitHub Pages** - Free hosting for static sites

#### Backend (Server)
- **Render** - Free tier with automatic deployments
- **Railway** - Simple deployment with Git integration
- **Heroku** - Popular platform with easy scaling

### Deployment Steps

1. **Deploy Server**:
   - Push server code to your Git repository
   - Connect to your chosen platform (Render, Railway, etc.)
   - Set environment variables (PORT, CLIENT_URL)
   - Deploy and note the server URL

2. **Deploy Client**:
   - Update `VITE_SOCKET_URL` in client/.env to your deployed server URL
   - Push client code to Git repository
   - Connect to your chosen platform (Vercel, Netlify, etc.)
   - Deploy the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Socket.io team for the excellent real-time communication library
- React team for the powerful UI library
- Express.js team for the minimal web framework
- All the open-source contributors who made this possible

---

**Built with ❤️ for Week 5 Assignment - PLP MERN Stack Development** 
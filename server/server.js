// server.js - Main server file for Socket.io chat application with MongoDB

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import database and models
const connectDB = require('./config/database');
const Room = require('./models/Room');

// Import socket handlers
const { setupSocketHandlers } = require('./socket/socketHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then((connection) => {
  if (connection) {
    console.log('🚀 Server starting with MongoDB integration...');
    global.mongoConnected = true;
    // Initialize default rooms
    Room.createDefaultRooms();
  } else {
    console.log('🚀 Server starting in memory-only mode...');
    global.mongoConnected = false;
  }
});

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Setup Socket.io handlers
setupSocketHandlers(io);

// API routes
const Message = require('./models/Message');
const User = require('./models/User');

app.get('/api/messages', async (req, res) => {
  try {
    const { room, limit = 50, skip = 0 } = req.query;
    
    if (global.mongoConnected) {
      if (room) {
        const messages = await Message.getMessagesForRoom(room, parseInt(limit), parseInt(skip));
        res.json(messages);
      } else {
        const messages = await Message.find({ isDeleted: false })
          .populate('sender', 'username avatar')
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .skip(parseInt(skip));
        res.json(messages);
      }
    } else {
      res.json([]); // Return empty array if no database
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const { room } = req.query;
    
    if (global.mongoConnected) {
      if (room) {
        const users = await User.getUsersInRoom(room);
        res.json(users);
      } else {
        const users = await User.getOnlineUsers();
        res.json(users);
      }
    } else {
      res.json([]); // Return empty array if no database
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    if (global.mongoConnected) {
      const rooms = await Room.getPublicRooms();
      res.json(rooms);
    } else {
      // Return default rooms for memory mode
      const defaultRooms = [
        { roomId: 'general', name: 'General', description: 'Main chat room' },
        { roomId: 'random', name: 'Random', description: 'Off-topic discussions' },
        { roomId: 'tech', name: 'Tech Talk', description: 'Technology discussions' },
        { roomId: 'announcements', name: 'Announcements', description: 'Important updates' }
      ];
      res.json(defaultRooms);
    }
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.get('/api/messages/search', async (req, res) => {
  try {
    const { q: query, room, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    if (global.mongoConnected) {
      const messages = await Message.searchMessages(query, room, parseInt(limit));
      res.json(messages);
    } else {
      res.json([]); // Return empty array if no database
    }
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

app.get('/api/private-messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { with: otherUserId, limit = 50 } = req.query;
    
    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID is required' });
    }
    
    if (global.mongoConnected) {
      const messages = await Message.getPrivateMessages(userId, otherUserId, parseInt(limit));
      res.json(messages.reverse());
    } else {
      res.json([]); // Return empty array if no database
    }
  } catch (error) {
    console.error('Error fetching private messages:', error);
    res.status(500).json({ error: 'Failed to fetch private messages' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h1>Socket.io Chat Server</h1>
    <p>Status: ${global.mongoConnected ? '🟢 MongoDB Connected' : '🟡 Memory Mode'}</p>
    <p>Server running on port ${process.env.PORT || 5000}</p>
    <p>Client URL: <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">${process.env.CLIENT_URL || 'http://localhost:5173'}</a></p>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: global.mongoConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`💾 Database: ${global.mongoConnected ? 'MongoDB' : 'Memory Mode'}`);
});

module.exports = { app, server, io };
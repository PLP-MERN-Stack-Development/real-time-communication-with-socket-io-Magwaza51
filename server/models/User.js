// models/User.js - User model for MongoDB

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Username must be at least 2 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null values but enforces uniqueness when present
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away', 'busy'],
    default: 'offline'
  },
  isGuest: {
    type: Boolean,
    default: true
  },
  socketId: {
    type: String,
    default: null
  },
  currentRoom: {
    type: String,
    default: 'general'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

// Set user online/offline
userSchema.methods.setStatus = function(status, socketId = null) {
  this.status = status;
  this.socketId = socketId;
  if (status === 'online') {
    this.lastSeen = new Date();
  }
  return this.save();
};

// Find or create guest user
userSchema.statics.findOrCreateGuest = async function(username, socketId) {
  try {
    let user = await this.findOne({ username, isGuest: true });
    
    if (!user) {
      user = new this({
        username,
        isGuest: true,
        status: 'online',
        socketId
      });
      await user.save();
    } else {
      user.status = 'online';
      user.socketId = socketId;
      user.lastSeen = new Date();
      await user.save();
    }
    
    return user;
  } catch (error) {
    throw new Error(`Error creating guest user: ${error.message}`);
  }
};

// Get online users
userSchema.statics.getOnlineUsers = function() {
  return this.find({ status: { $ne: 'offline' } }).select('-password');
};

// Get users in room
userSchema.statics.getUsersInRoom = function(room) {
  return this.find({ 
    currentRoom: room, 
    status: { $ne: 'offline' } 
  }).select('-password');
};

module.exports = mongoose.model('User', userSchema);
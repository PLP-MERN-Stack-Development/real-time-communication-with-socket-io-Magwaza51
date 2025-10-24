// models/Room.js - Room model for MongoDB

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [50, 'Room name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Room description cannot exceed 200 characters'],
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null
  },
  maxUsers: {
    type: Number,
    default: 100,
    min: [2, 'Room must allow at least 2 users'],
    max: [1000, 'Room cannot exceed 1000 users']
  },
  currentUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  bannedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bannedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowReactions: {
      type: Boolean,
      default: true
    },
    slowMode: {
      type: Number, // Seconds between messages
      default: 0
    },
    requireModeration: {
      type: Boolean,
      default: false
    }
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
roomSchema.index({ isPrivate: 1, isActive: 1 });
roomSchema.index({ lastActivity: -1 });

// Virtual for current user count
roomSchema.virtual('userCount').get(function() {
  return this.currentUsers.length;
});

// Virtual for is full
roomSchema.virtual('isFull').get(function() {
  return this.currentUsers.length >= this.maxUsers;
});

// Add user to room
roomSchema.methods.addUser = function(userId, username, role = 'member') {
  // Check if user is already in room
  const existingUser = this.currentUsers.find(u => u.user.toString() === userId.toString());
  
  if (existingUser) {
    return { success: false, message: 'User already in room' };
  }
  
  // Check if room is full
  if (this.isFull) {
    return { success: false, message: 'Room is full' };
  }
  
  // Check if user is banned
  const isBanned = this.bannedUsers.some(b => b.user.toString() === userId.toString());
  if (isBanned) {
    return { success: false, message: 'User is banned from this room' };
  }
  
  this.currentUsers.push({
    user: userId,
    username,
    role,
    joinedAt: new Date()
  });
  
  this.lastActivity = new Date();
  return { success: true, message: 'User added to room' };
};

// Remove user from room
roomSchema.methods.removeUser = function(userId) {
  const userIndex = this.currentUsers.findIndex(u => u.user.toString() === userId.toString());
  
  if (userIndex > -1) {
    this.currentUsers.splice(userIndex, 1);
    this.lastActivity = new Date();
    return { success: true, message: 'User removed from room' };
  }
  
  return { success: false, message: 'User not found in room' };
};

// Ban user from room
roomSchema.methods.banUser = function(userId, username, bannedBy, reason = '') {
  // Remove from current users if present
  this.removeUser(userId);
  
  // Add to banned users
  const alreadyBanned = this.bannedUsers.some(b => b.user.toString() === userId.toString());
  
  if (!alreadyBanned) {
    this.bannedUsers.push({
      user: userId,
      username,
      bannedBy,
      reason,
      bannedAt: new Date()
    });
  }
  
  return { success: true, message: 'User banned from room' };
};

// Unban user
roomSchema.methods.unbanUser = function(userId) {
  const bannedIndex = this.bannedUsers.findIndex(b => b.user.toString() === userId.toString());
  
  if (bannedIndex > -1) {
    this.bannedUsers.splice(bannedIndex, 1);
    return { success: true, message: 'User unbanned from room' };
  }
  
  return { success: false, message: 'User not found in banned list' };
};

// Update user role
roomSchema.methods.updateUserRole = function(userId, newRole) {
  const user = this.currentUsers.find(u => u.user.toString() === userId.toString());
  
  if (user) {
    user.role = newRole;
    return { success: true, message: 'User role updated' };
  }
  
  return { success: false, message: 'User not found in room' };
};

// Check if user can perform action
roomSchema.methods.canUserPerformAction = function(userId, action) {
  const user = this.currentUsers.find(u => u.user.toString() === userId.toString());
  
  if (!user) return false;
  
  const permissions = {
    'send_message': ['member', 'moderator', 'admin'],
    'delete_message': ['moderator', 'admin'],
    'ban_user': ['moderator', 'admin'],
    'modify_room': ['admin'],
    'delete_room': ['admin']
  };
  
  return permissions[action]?.includes(user.role) || false;
};

// Static method to get public rooms
roomSchema.statics.getPublicRooms = function() {
  return this.find({ 
    isPrivate: false, 
    isActive: true 
  }).select('-password -bannedUsers');
};

// Static method to search rooms
roomSchema.statics.searchRooms = function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ],
    isPrivate: false,
    isActive: true
  }).select('-password -bannedUsers');
};

// Static method to create default rooms
roomSchema.statics.createDefaultRooms = async function() {
  const defaultRooms = [
    {
      roomId: 'general',
      name: 'General',
      description: 'Main chat room for general discussions'
    },
    {
      roomId: 'random',
      name: 'Random',
      description: 'Off-topic discussions and random chats'
    },
    {
      roomId: 'tech',
      name: 'Tech Talk',
      description: 'Technology discussions and programming help'
    },
    {
      roomId: 'announcements',
      name: 'Announcements',
      description: 'Important updates and announcements'
    }
  ];

  for (const roomData of defaultRooms) {
    const existingRoom = await this.findOne({ roomId: roomData.roomId });
    if (!existingRoom) {
      const room = new this(roomData);
      await room.save();
      console.log(`Created default room: ${roomData.name}`);
    }
  }
};

module.exports = mongoose.model('Room', roomSchema);
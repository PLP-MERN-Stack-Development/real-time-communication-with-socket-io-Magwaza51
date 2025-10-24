// models/Message.js - Message model for MongoDB

const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true
  },
  users: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { _id: false });

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderUsername: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true,
    default: 'general'
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  recipientUsername: {
    type: String,
    default: null
  },
  reactions: [reactionSchema],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  editedAt: {
    type: Date,
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  originalContent: {
    type: String,
    default: null
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ isPrivate: 1, recipient: 1, sender: 1 });

// Virtual for reaction count
messageSchema.virtual('reactionCount').get(function() {
  return this.reactions.reduce((total, reaction) => total + reaction.users.length, 0);
});

// Add reaction method
messageSchema.methods.addReaction = function(emoji, userId, username) {
  const existingReaction = this.reactions.find(r => r.emoji === emoji);
  
  if (existingReaction) {
    const userIndex = existingReaction.users.findIndex(u => u.userId.toString() === userId.toString());
    
    if (userIndex > -1) {
      // Remove reaction
      existingReaction.users.splice(userIndex, 1);
      if (existingReaction.users.length === 0) {
        this.reactions = this.reactions.filter(r => r.emoji !== emoji);
      }
      return { action: 'removed', emoji };
    } else {
      // Add user to existing reaction
      existingReaction.users.push({ userId, username });
      return { action: 'added', emoji };
    }
  } else {
    // Create new reaction
    this.reactions.push({
      emoji,
      users: [{ userId, username }]
    });
    return { action: 'added', emoji };
  }
};

// Mark as read by user
messageSchema.methods.markAsRead = function(userId, username) {
  const alreadyRead = this.readBy.find(r => r.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      username,
      readAt: new Date()
    });
  }
  
  return this.save();
};

// Edit message
messageSchema.methods.editContent = function(newContent) {
  if (!this.originalContent) {
    this.originalContent = this.content;
  }
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Soft delete message
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = 'This message has been deleted';
  return this.save();
};

// Static method to get messages for a room
messageSchema.statics.getMessagesForRoom = function(room, limit = 50, skip = 0) {
  return this.find({ 
    room, 
    isDeleted: false 
  })
  .populate('sender', 'username avatar status')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip)
  .lean();
};

// Static method to get private messages between users
messageSchema.statics.getPrivateMessages = function(user1Id, user2Id, limit = 50) {
  return this.find({
    isPrivate: true,
    isDeleted: false,
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id }
    ]
  })
  .populate('sender recipient', 'username avatar')
  .sort({ createdAt: -1 })
  .limit(limit)
  .lean();
};

// Static method to search messages
messageSchema.statics.searchMessages = function(query, room = null, limit = 20) {
  const searchQuery = {
    content: { $regex: query, $options: 'i' },
    isDeleted: false
  };
  
  if (room) {
    searchQuery.room = room;
    searchQuery.isPrivate = false;
  }
  
  return this.find(searchQuery)
    .populate('sender', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('Message', messageSchema);
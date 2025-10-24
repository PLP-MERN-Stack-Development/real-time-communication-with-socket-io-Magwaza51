// socket/socketHandler.js - Main socket.io event handling setup

const ChatController = require('../controllers/chatController');

// Store connected users and typing status
const connectedUsers = {}; // { socketId: { username, userId, room } }
const typingUsers = {};

// Fallback memory storage when MongoDB is not available
const memoryStorage = {
  users: {},
  messages: {},
  rooms: {
    'general': { name: 'General', description: 'Main chat room' },
    'random': { name: 'Random', description: 'Off-topic discussions' },
    'tech': { name: 'Tech Talk', description: 'Technology discussions' },
    'announcements': { name: 'Announcements', description: 'Important updates' }
  }
};

// Initialize message arrays for each room
Object.keys(memoryStorage.rooms).forEach(roomId => {
  memoryStorage.messages[roomId] = [];
});

// Helper function to check if MongoDB is connected
const isMongoConnected = () => global.mongoConnected;

// Setup socket.io event handlers
const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining
    socket.on('user_join', async (userData) => {
      try {
        if (isMongoConnected()) {
          await ChatController.handleUserJoin(socket, userData, connectedUsers, io);
        } else {
          // Fallback memory mode
          const { username, room = 'general' } = userData;
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          memoryStorage.users[socket.id] = { 
            username, 
            id: socket.id, 
            userId,
            room,
            joinedAt: new Date().toISOString() 
          };
          
          connectedUsers[socket.id] = { username, userId, room };
          
          // Join room and send data
          socket.join(room);
          
          const roomMessages = memoryStorage.messages[room] || [];
          socket.emit('message_history', roomMessages.slice(-20));
          
          socket.emit('room_list', Object.keys(memoryStorage.rooms).map(id => ({ 
            roomId: id, 
            ...memoryStorage.rooms[id] 
          })));
          
          socket.to(room).emit('user_joined', { username, id: socket.id, room });
          
          const roomUsers = Object.values(memoryStorage.users).filter(user => user.room === room);
          io.to(room).emit('user_list', roomUsers);
          
          console.log(`${username} joined room: ${room} (Memory mode)`);
        }
      } catch (error) {
        console.error('Error in user_join:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle chat messages
    socket.on('send_message', async (messageData, callback) => {
      try {
        if (isMongoConnected()) {
          await ChatController.handleSendMessage(socket, messageData, callback, connectedUsers, io);
        } else {
          // Fallback memory mode
          const userConnection = connectedUsers[socket.id];
          if (!userConnection) return;
          
          const { userId, username, room } = userConnection;
          
          const message = {
            id: Date.now(),
            content: messageData.message || messageData.content,
            sender: username,
            senderId: socket.id,
            userId: userId,
            room,
            timestamp: new Date().toISOString(),
            reactions: {},
            readBy: [socket.id]
          };
          
          if (!memoryStorage.messages[room]) memoryStorage.messages[room] = [];
          memoryStorage.messages[room].push(message);
          
          if (memoryStorage.messages[room].length > 1000) {
            memoryStorage.messages[room].shift();
          }
          
          io.to(room).emit('receive_message', message);
          
          if (callback) {
            callback({ 
              success: true, 
              messageId: message.id,
              timestamp: message.timestamp 
            });
          }
        }
      } catch (error) {
        console.error('Error in send_message:', error);
        if (callback) {
          callback({ success: false, error: 'Failed to send message' });
        }
      }
    });

    // Handle message reactions
    socket.on('toggle_reaction', async (data) => {
      try {
        if (isMongoConnected()) {
          await ChatController.handleToggleReaction(socket, data, connectedUsers, io);
        } else {
          // Fallback memory mode for reactions
          const { messageId, emoji } = data;
          const userConnection = connectedUsers[socket.id];
          if (!userConnection) return;
          
          const { room, username } = userConnection;
          const roomMessages = memoryStorage.messages[room] || [];
          const message = roomMessages.find(msg => msg.id === messageId);
          
          if (message) {
            if (!message.reactions[emoji]) {
              message.reactions[emoji] = [];
            }
            
            const userIndex = message.reactions[emoji].findIndex(u => u.id === socket.id);
            
            if (userIndex > -1) {
              message.reactions[emoji].splice(userIndex, 1);
              if (message.reactions[emoji].length === 0) {
                delete message.reactions[emoji];
              }
            } else {
              message.reactions[emoji].push({ id: socket.id, username });
            }
            
            io.to(room).emit('message_reaction_updated', { messageId, reactions: message.reactions });
          }
        }
      } catch (error) {
        console.error('Error in toggle_reaction:', error);
      }
    });

    // Handle room switching
    socket.on('join_room', async (roomId) => {
      try {
        if (isMongoConnected()) {
          await ChatController.handleJoinRoom(socket, roomId, connectedUsers, io);
        } else {
          // Fallback memory mode
          const userConnection = connectedUsers[socket.id];
          if (!userConnection) return;
          
          const { username } = userConnection;
          const oldRoom = userConnection.room;
          
          // Leave old room
          if (oldRoom) {
            socket.leave(oldRoom);
            socket.to(oldRoom).emit('user_left', { username, id: socket.id, room: oldRoom });
            
            const oldRoomUsers = Object.values(memoryStorage.users).filter(u => u.room === oldRoom);
            io.to(oldRoom).emit('user_list', oldRoomUsers);
          }
          
          // Join new room
          userConnection.room = roomId;
          if (memoryStorage.users[socket.id]) {
            memoryStorage.users[socket.id].room = roomId;
          }
          socket.join(roomId);
          
          if (!memoryStorage.messages[roomId]) {
            memoryStorage.messages[roomId] = [];
          }
          
          const roomMessages = memoryStorage.messages[roomId] || [];
          socket.emit('message_history', roomMessages.slice(-20));
          
          socket.to(roomId).emit('user_joined', { username, id: socket.id, room: roomId });
          
          const newRoomUsers = Object.values(memoryStorage.users).filter(u => u.room === roomId);
          io.to(roomId).emit('user_list', newRoomUsers);
          
          console.log(`${username} moved from ${oldRoom} to ${roomId} (Memory mode)`);
        }
      } catch (error) {
        console.error('Error in join_room:', error);
      }
    });

    // Handle typing indicator
    socket.on('typing', (isTyping) => {
      const userConnection = connectedUsers[socket.id];
      if (userConnection) {
        const { username } = userConnection;
        
        if (isTyping) {
          typingUsers[socket.id] = username;
        } else {
          delete typingUsers[socket.id];
        }
        
        io.emit('typing_users', Object.values(typingUsers));
      }
    });

    // Handle private messages
    socket.on('private_message', async ({ to, message }) => {
      try {
        const userConnection = connectedUsers[socket.id];
        if (!userConnection) return;
        
        const { username } = userConnection;
        
        const messageData = {
          id: Date.now(),
          sender: username,
          senderId: socket.id,
          message,
          timestamp: new Date().toISOString(),
          isPrivate: true,
        };
        
        socket.to(to).emit('private_message', messageData);
        socket.emit('private_message', messageData);
      } catch (error) {
        console.error('Error in private_message:', error);
      }
    });

    // Handle mark message as read
    socket.on('mark_message_read', async (messageId) => {
      try {
        if (isMongoConnected()) {
          const userConnection = connectedUsers[socket.id];
          if (!userConnection) return;
          
          const { userId, username } = userConnection;
          
          const Message = require('../models/Message');
          const message = await Message.findById(messageId);
          if (message) {
            await message.markAsRead(userId, username);
            
            if (message.sender.toString() !== userId.toString()) {
              const senderConnection = Object.values(connectedUsers)
                .find(conn => conn.userId.toString() === message.sender.toString());
              
              if (senderConnection) {
                const senderSocketId = Object.keys(connectedUsers)
                  .find(socketId => connectedUsers[socketId] === senderConnection);
                
                if (senderSocketId) {
                  io.to(senderSocketId).emit('message_read', {
                    messageId,
                    readBy: username,
                    timestamp: new Date().toISOString()
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in mark_message_read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        if (isMongoConnected()) {
          await ChatController.handleDisconnect(socket, connectedUsers, io);
        } else {
          // Fallback memory mode
          const userConnection = connectedUsers[socket.id];
          if (userConnection) {
            const { username } = userConnection;
            io.emit('user_left', { username, id: socket.id });
            console.log(`${username} left the chat (Memory mode)`);
          }
          
          delete memoryStorage.users[socket.id];
          delete connectedUsers[socket.id];
          
          const allUsers = Object.values(memoryStorage.users);
          io.emit('user_list', allUsers);
        }
        
        delete typingUsers[socket.id];
        io.emit('typing_users', Object.values(typingUsers));
        
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });
};

module.exports = {
  setupSocketHandlers,
  connectedUsers,
  typingUsers,
  memoryStorage
};
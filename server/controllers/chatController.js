// controllers/chatController.js - Chat message handling logic

const Message = require('../models/Message');
const User = require('../models/User');
const Room = require('../models/Room');

class ChatController {
  // Handle user joining a room
  static async handleUserJoin(socket, userData, connectedUsers, io) {
    try {
      const { username, room = 'general' } = userData;
      
      if (global.mongoConnected) {
        // MongoDB mode
        const user = await User.findOrCreateGuest(username, socket.id);
        user.currentRoom = room;
        await user.save();
        
        connectedUsers[socket.id] = {
          username: user.username,
          userId: user._id,
          room: room
        };
        
        // Get and send recent messages for this room
        const recentMessages = await Message.getMessagesForRoom(room, 20);
        socket.emit('message_history', recentMessages.reverse());
        
        // Get and send room list
        const roomList = await Room.getPublicRooms();
        socket.emit('room_list', roomList);
        
        // Add user to room in database
        const roomDoc = await Room.findOne({ roomId: room });
        if (roomDoc) {
          roomDoc.addUser(user._id, username);
          await roomDoc.save();
        }
        
        // Send updated user list for the room
        const roomUsers = await User.getUsersInRoom(room);
        io.to(room).emit('user_list', roomUsers);
        
      } else {
        // Memory mode fallback handled in main socket handler
        throw new Error('MongoDB not connected - using fallback mode');
      }
      
      // Join the specified room
      socket.join(room);
      
      // Notify room users
      socket.to(room).emit('user_joined', { 
        username, 
        id: socket.id, 
        room
      });
      
      console.log(`${username} joined room: ${room} (MongoDB mode)`);
      
    } catch (error) {
      console.error('Error in ChatController.handleUserJoin:', error);
      throw error;
    }
  }

  // Handle sending messages
  static async handleSendMessage(socket, messageData, callback, connectedUsers, io) {
    try {
      const userConnection = connectedUsers[socket.id];
      if (!userConnection) return;
      
      const { userId, username, room } = userConnection;
      
      if (global.mongoConnected) {
        // MongoDB mode
        const newMessage = new Message({
          content: messageData.message || messageData.content,
          sender: userId,
          senderUsername: username,
          room: room,
          messageType: messageData.type || 'text'
        });
        
        const savedMessage = await newMessage.save();
        await savedMessage.populate('sender', 'username avatar status');
        
        // Update user's message count
        await User.findByIdAndUpdate(userId, { $inc: { messageCount: 1 } });
        
        // Update room's message count and last activity
        await Room.findOneAndUpdate(
          { roomId: room },
          { 
            $inc: { messageCount: 1 },
            lastActivity: new Date()
          }
        );
        
        const messageToSend = {
          id: savedMessage._id,
          content: savedMessage.content,
          sender: username,
          senderId: socket.id,
          userId: userId,
          room: room,
          timestamp: savedMessage.createdAt,
          reactions: savedMessage.reactions,
          readBy: [socket.id]
        };
        
        io.to(room).emit('receive_message', messageToSend);
        
        if (callback) {
          callback({ 
            success: true, 
            messageId: savedMessage._id,
            timestamp: savedMessage.createdAt 
          });
        }
        
      } else {
        // Fallback handled in main socket handler
        throw new Error('MongoDB not connected - using fallback mode');
      }
      
    } catch (error) {
      console.error('Error in ChatController.handleSendMessage:', error);
      if (callback) {
        callback({ success: false, error: 'Failed to send message' });
      }
    }
  }

  // Handle message reactions
  static async handleToggleReaction(socket, data, connectedUsers, io) {
    try {
      const { messageId, emoji } = data;
      const userConnection = connectedUsers[socket.id];
      if (!userConnection) return;
      
      const { userId, username, room } = userConnection;
      
      if (global.mongoConnected) {
        // Find the message in database
        const message = await Message.findById(messageId);
        if (!message) return;
        
        // Toggle reaction
        const result = message.addReaction(emoji, userId, username);
        await message.save();
        
        // Send updated reactions to all users in the room
        io.to(room).emit('message_reaction_updated', { 
          messageId, 
          reactions: message.reactions 
        });
      }
    } catch (error) {
      console.error('Error in ChatController.handleToggleReaction:', error);
    }
  }

  // Handle room switching
  static async handleJoinRoom(socket, roomId, connectedUsers, io) {
    try {
      const userConnection = connectedUsers[socket.id];
      if (!userConnection) return;
      
      const { userId, username } = userConnection;
      const oldRoom = userConnection.room;
      
      if (global.mongoConnected) {
        // Update user's room in database
        await User.findByIdAndUpdate(userId, { currentRoom: roomId });
        
        // Leave old room
        if (oldRoom) {
          socket.leave(oldRoom);
          
          // Remove user from old room in database
          const oldRoomDoc = await Room.findOne({ roomId: oldRoom });
          if (oldRoomDoc) {
            oldRoomDoc.removeUser(userId);
            await oldRoomDoc.save();
          }
          
          socket.to(oldRoom).emit('user_left', { 
            username, 
            id: socket.id, 
            room: oldRoom 
          });
          
          // Send updated user list for old room
          const oldRoomUsers = await User.getUsersInRoom(oldRoom);
          io.to(oldRoom).emit('user_list', oldRoomUsers);
        }
        
        // Join new room
        userConnection.room = roomId;
        socket.join(roomId);
        
        // Add user to new room in database
        const newRoomDoc = await Room.findOne({ roomId: roomId });
        if (newRoomDoc) {
          newRoomDoc.addUser(userId, username);
          await newRoomDoc.save();
        }
        
        // Send room messages
        const roomMessages = await Message.getMessagesForRoom(roomId, 20);
        socket.emit('message_history', roomMessages.reverse());
        
        // Notify new room
        socket.to(roomId).emit('user_joined', { 
          username, 
          id: socket.id, 
          room: roomId 
        });
        
        // Send updated user list for new room
        const newRoomUsers = await User.getUsersInRoom(roomId);
        io.to(roomId).emit('user_list', newRoomUsers);
        
        console.log(`${username} moved from ${oldRoom} to ${roomId}`);
      }
    } catch (error) {
      console.error('Error in ChatController.handleJoinRoom:', error);
    }
  }

  // Handle user disconnect
  static async handleDisconnect(socket, connectedUsers, io) {
    try {
      const userConnection = connectedUsers[socket.id];
      if (userConnection) {
        const { username, userId, room } = userConnection;
        
        if (global.mongoConnected) {
          // Update user status in database
          await User.findByIdAndUpdate(userId, { 
            status: 'offline',
            socketId: null,
            lastSeen: new Date()
          });
          
          // Remove user from room in database
          if (room) {
            const roomDoc = await Room.findOne({ roomId: room });
            if (roomDoc) {
              roomDoc.removeUser(userId);
              await roomDoc.save();
            }
            
            // Notify room users
            socket.to(room).emit('user_left', { 
              username, 
              id: socket.id, 
              room 
            });
            
            // Send updated user list
            const roomUsers = await User.getUsersInRoom(room);
            io.to(room).emit('user_list', roomUsers);
          }
        }
        
        console.log(`${username} left the chat`);
      }
      
      // Clean up connection data
      delete connectedUsers[socket.id];
      
    } catch (error) {
      console.error('Error in ChatController.handleDisconnect:', error);
    }
  }
}

module.exports = ChatController;
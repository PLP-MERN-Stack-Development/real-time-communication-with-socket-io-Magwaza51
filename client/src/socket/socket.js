// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState([]);

  // Connect to socket server
  const connect = (username, room = 'general') => {
    socket.connect();
    if (username) {
      socket.emit('user_join', { username, room });
      setCurrentRoom(room);
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message) => {
    return new Promise((resolve, reject) => {
      socket.emit('send_message', { message }, (acknowledgment) => {
        if (acknowledgment?.success) {
          resolve(acknowledgment);
        } else {
          reject(new Error('Message delivery failed'));
        }
      });
    });
  };

  // Join a room
  const joinRoom = (roomId) => {
    socket.emit('join_room', roomId);
    setCurrentRoom(roomId);
    setMessages([]); // Clear messages when switching rooms
  };

  // Mark message as read
  const markMessageRead = (messageId) => {
    socket.emit('mark_message_read', messageId);
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Toggle message reaction
  const toggleReaction = (messageId, emoji) => {
    socket.emit('toggle_reaction', { messageId, emoji });
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    const onMessageHistory = (history) => {
      setMessages(history);
    };

    const onMessageReactionUpdated = ({ messageId, reactions }) => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, reactions } 
            : msg
        )
      );
    };

    const onRoomList = (roomList) => {
      setRooms(roomList);
    };

    const onMessageRead = ({ messageId, readBy }) => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, readBy: [...(msg.readBy || []), readBy] } 
            : msg
        )
      );
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('message_history', onMessageHistory);
    socket.on('message_reaction_updated', onMessageReactionUpdated);
    socket.on('room_list', onRoomList);
    socket.on('message_read', onMessageRead);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('message_history', onMessageHistory);
      socket.off('message_reaction_updated', onMessageReactionUpdated);
      socket.off('room_list', onRoomList);
      socket.off('message_read', onMessageRead);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    currentRoom,
    rooms,
    connect,
    disconnect,
    sendMessage,
    joinRoom,
    markMessageRead,
    sendPrivateMessage,
    toggleReaction,
    setTyping,
  };
};

export default socket; 
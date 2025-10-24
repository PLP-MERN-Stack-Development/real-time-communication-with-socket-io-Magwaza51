// hooks/useChat.js - Custom hook for chat functionality

import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../context/ChatContext';

export const useChatSocket = () => {
  const { socket, isConnected } = useSocket();
  const {
    setMessages,
    addMessage,
    setUsers,
    addUser,
    removeUser,
    setTypingUsers,
    updateMessageReaction,
    addPrivateMessage,
    setRooms,
    setOnlineStatus,
    setError,
    currentRoom,
    user,
  } = useChat();

  // Join a room
  const joinRoom = useCallback((roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  }, [socket, isConnected]);

  // Send a message
  const sendMessage = useCallback((content, type = 'text') => {
    if (socket && isConnected && content.trim()) {
      return new Promise((resolve, reject) => {
        socket.emit('send_message', 
          { message: content, type }, 
          (response) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.error || 'Failed to send message'));
            }
          }
        );
      });
    }
    return Promise.reject(new Error('Not connected to server'));
  }, [socket, isConnected]);

  // Toggle message reaction
  const toggleReaction = useCallback((messageId, emoji) => {
    if (socket && isConnected) {
      socket.emit('toggle_reaction', { messageId, emoji });
    }
  }, [socket, isConnected]);

  // Send private message
  const sendPrivateMessage = useCallback((recipientId, message) => {
    if (socket && isConnected) {
      socket.emit('private_message', { to: recipientId, message });
    }
  }, [socket, isConnected]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', isTyping);
    }
  }, [socket, isConnected]);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId) => {
    if (socket && isConnected) {
      socket.emit('mark_message_read', messageId);
    }
  }, [socket, isConnected]);

  // Join user with username
  const joinUser = useCallback((username, room = 'general') => {
    if (socket && isConnected) {
      socket.emit('user_join', { username, room });
    }
  }, [socket, isConnected]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Connection status
    const handleConnect = () => {
      setOnlineStatus(true);
      setError(null);
    };

    const handleDisconnect = () => {
      setOnlineStatus(false);
    };

    const handleConnectError = (error) => {
      setError(`Connection failed: ${error.message}`);
      setOnlineStatus(false);
    };

    // Chat events
    const handleMessageHistory = (messages) => {
      setMessages(messages);
    };

    const handleReceiveMessage = (message) => {
      addMessage(message);
    };

    const handleUserJoined = (user) => {
      addUser(user);
    };

    const handleUserLeft = (user) => {
      removeUser(user);
    };

    const handleUserList = (users) => {
      setUsers(users);
    };

    const handleTypingUsers = (users) => {
      setTypingUsers(users);
    };

    const handleMessageReactionUpdated = ({ messageId, reactions }) => {
      updateMessageReaction(messageId, reactions);
    };

    const handlePrivateMessage = (message) => {
      addPrivateMessage(message);
    };

    const handleRoomList = (rooms) => {
      setRooms(rooms);
    };

    const handleError = (error) => {
      setError(error.message || 'An error occurred');
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('message_history', handleMessageHistory);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('user_list', handleUserList);
    socket.on('typing_users', handleTypingUsers);
    socket.on('message_reaction_updated', handleMessageReactionUpdated);
    socket.on('private_message', handlePrivateMessage);
    socket.on('room_list', handleRoomList);
    socket.on('error', handleError);

    // Cleanup event listeners
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('message_history', handleMessageHistory);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('user_list', handleUserList);
      socket.off('typing_users', handleTypingUsers);
      socket.off('message_reaction_updated', handleMessageReactionUpdated);
      socket.off('private_message', handlePrivateMessage);
      socket.off('room_list', handleRoomList);
      socket.off('error', handleError);
    };
  }, [socket, setMessages, addMessage, setUsers, addUser, removeUser, setTypingUsers, updateMessageReaction, addPrivateMessage, setRooms, setOnlineStatus, setError]);

  return {
    isConnected,
    joinRoom,
    sendMessage,
    toggleReaction,
    sendPrivateMessage,
    sendTyping,
    markMessageAsRead,
    joinUser,
  };
};

export default useChatSocket;
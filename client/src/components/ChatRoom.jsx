import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../socket/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MessageSearch from './MessageSearch';
import UserList from './UserList';
import RoomManager from './RoomManager';
import TypingIndicator from './TypingIndicator';

const ChatRoom = ({ username, onLogout }) => {
  const { 
    messages, 
    users, 
    typingUsers,
    currentRoom,
    rooms,
    sendMessage, 
    joinRoom,
    markMessageRead,
    sendPrivateMessage, 
    toggleReaction,
    setTyping 
  } = useSocket();
  
  const [privateMessageTarget, setPrivateMessageTarget] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [filteredMessages, setFilteredMessages] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle notifications for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Don't notify for own messages or system messages
      if (lastMessage.sender !== username && !lastMessage.system) {
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${lastMessage.sender}`, {
            body: lastMessage.message,
            icon: '/favicon.ico'
          });
        }
        
        // Play notification sound
        playNotificationSound();
        
        // Show in-app notification
        setNotification(`New message from ${lastMessage.sender}`);
        setTimeout(() => setNotification(null), 3000);
        
        // Update unread count if document is not visible
        if (document.hidden) {
          setUnreadCount(prev => prev + 1);
        }
      }
    }
  }, [messages, username]);

  // Reset unread count when document becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setUnreadCount(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleSendMessage = async (message) => {
    try {
      if (privateMessageTarget) {
        await sendPrivateMessage(privateMessageTarget.id, message);
      } else {
        await sendMessage(message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNotification('Failed to send message. Please try again.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRoomChange = (roomId) => {
    joinRoom(roomId);
    setPrivateMessageTarget(null);
    setFilteredMessages(null);
  };

  const handleCreateRoom = (room) => {
    // For now, just switch to the room (server will handle creation)
    handleRoomChange(room.id);
  };

  const handlePrivateMessage = (user) => {
    setPrivateMessageTarget(user);
  };

  const clearPrivateMessage = () => {
    setPrivateMessageTarget(null);
  };

  return (
    <div className="chat-container">
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#007bff',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          {notification}
        </div>
      )}

      <div className="sidebar">
        <div style={{ marginBottom: '20px' }}>
          <h3>Socket.io Chat</h3>
          <p style={{ fontSize: '14px', color: '#bdc3c7' }}>
            Welcome, {username}!
          </p>
          <button 
            onClick={onLogout}
            style={{ 
              marginTop: '10px',
              background: '#e74c3c',
              border: 'none',
              padding: '8px 16px',
              fontSize: '12px'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px' }}>Chat Rooms</h4>
          <RoomManager 
            currentRoom={currentRoom}
            onRoomChange={handleRoomChange}
            onCreateRoom={handleCreateRoom}
          />
        </div>

        {privateMessageTarget && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px' }}>Private Chat</h4>
            <div style={{ 
              background: '#3498db', 
              padding: '8px', 
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>@ {privateMessageTarget.username}</span>
              <button
                onClick={clearPrivateMessage}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '2px 6px'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <UserList 
          users={users} 
          currentUser={username}
          onPrivateMessage={handlePrivateMessage}
        />
      </div>

      <div className="main-chat">
        <div className="chat-header">
          <h3>
            {privateMessageTarget 
              ? `Private chat with ${privateMessageTarget.username}` 
              : `# ${currentRoom}`
            }
          </h3>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {users.length} user{users.length !== 1 ? 's' : ''} online
            {unreadCount > 0 && (
              <span style={{ 
                background: '#e74c3c', 
                color: 'white', 
                borderRadius: '50%', 
                padding: '2px 6px', 
                fontSize: '12px',
                marginLeft: '10px'
              }}>
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        <MessageSearch 
          messages={filteredMessages || messages} 
          onFilteredMessages={setFilteredMessages}
        />

        <div className="messages-container">
          <MessageList 
            messages={filteredMessages || messages} 
            currentUser={username}
            isPrivateChat={!!privateMessageTarget}
            privateTarget={privateMessageTarget}
            onToggleReaction={toggleReaction}
            onMarkRead={markMessageRead}
          />
          <TypingIndicator typingUsers={typingUsers} currentUser={username} />
          <div ref={messagesEndRef} />
        </div>

        <MessageInput 
          onSendMessage={handleSendMessage}
          onTyping={setTyping}
          placeholder={
            privateMessageTarget 
              ? `Message ${privateMessageTarget.username}...` 
              : 'Type a message...'
          }
        />
      </div>
    </div>
  );
};

export default ChatRoom;
// pages/ChatPage.jsx - Main chat page component

import React from 'react';
import ChatRoom from '../components/ChatRoom';
import Login from '../components/Login';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';

const ChatPage = () => {
  const { user, loading, error } = useChat();
  const { isConnected, connectionError } = useSocket();

  // Show loading state
  if (loading) {
    return (
      <div className="chat-page loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Connecting to chat...</p>
        </div>
      </div>
    );
  }

  // Show connection error
  if (connectionError) {
    return (
      <div className="chat-page error">
        <div className="error-message">
          <h2>Connection Failed</h2>
          <p>{connectionError}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show general error
  if (error) {
    return (
      <div className="chat-page error">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show login if no user
  if (!user) {
    return (
      <div className="chat-page">
        <div className="login-container">
          <Login />
        </div>
      </div>
    );
  }

  // Show main chat interface
  return (
    <div className="chat-page">
      <div className="chat-container">
        <ChatRoom />
      </div>
      {!isConnected && (
        <div className="connection-status offline">
          <span>Disconnected - Attempting to reconnect...</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
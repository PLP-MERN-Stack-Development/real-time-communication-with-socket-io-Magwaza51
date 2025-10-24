import React, { useState, useRef, useEffect } from 'react';
import FileUpload from './FileUpload';

const MessageInput = ({ onSendMessage, onTyping, placeholder = 'Type a message...' }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message.trim());
    setMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Handle typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);

    // Stop typing immediately if input is empty
    if (e.target.value.length === 0 && isTyping) {
      setIsTyping(false);
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (file) => {
    const fileMessage = `📎 Shared a file: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
    onSendMessage(fileMessage);
    setShowFileUpload(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="message-input-container">
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setShowFileUpload(true)}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Share a file"
          >
            📎
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            style={{ 
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            style={{
              backgroundColor: message.trim() ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Send
          </button>
        </form>
        
        {message.length > 400 && (
          <div style={{ 
            fontSize: '12px', 
            color: message.length > 450 ? '#dc3545' : '#ffc107',
            marginTop: '5px',
            textAlign: 'right'
          }}>
            {message.length}/500 characters
          </div>
        )}
      </div>

      {showFileUpload && (
        <FileUpload 
          onFileSelect={handleFileSelect}
          onCancel={() => setShowFileUpload(false)}
        />
      )}
    </>
  );
};

export default MessageInput;
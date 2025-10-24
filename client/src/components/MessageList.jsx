import React, { useState, useEffect } from 'react';

const MessageList = ({ messages, currentUser, isPrivateChat, privateTarget, onToggleReaction, onMarkRead }) => {
  const [showReactions, setShowReactions] = useState({});

  // Mark messages as read when they come into view
  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach(message => {
        if (message.sender !== currentUser && onMarkRead) {
          onMarkRead(message.id);
        }
      });
    }
  }, [messages, currentUser, onMarkRead]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleReactionPicker = (messageId) => {
    setShowReactions(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleReaction = (messageId, emoji) => {
    onToggleReaction(messageId, emoji);
    setShowReactions(prev => ({
      ...prev,
      [messageId]: false
    }));
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const filterMessages = (messages) => {
    if (!isPrivateChat) {
      // Show all non-private messages for general chat
      return messages.filter(msg => !msg.isPrivate);
    } else {
      // Show only private messages between current user and target
      return messages.filter(msg => 
        msg.isPrivate && (
          (msg.sender === currentUser && msg.senderId === privateTarget?.id) ||
          (msg.sender === privateTarget?.username)
        )
      );
    }
  };

  const filteredMessages = filterMessages(messages);

  if (filteredMessages.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        color: '#666', 
        fontStyle: 'italic',
        padding: '20px'
      }}>
        {isPrivateChat 
          ? `No messages with ${privateTarget?.username} yet. Start the conversation!`
          : 'No messages yet. Be the first to say something!'
        }
      </div>
    );
  }

  return (
    <div>
      {filteredMessages.map((message) => (
        <div
          key={message.id}
          className={`message ${
            message.system 
              ? 'system' 
              : message.sender === currentUser 
                ? 'own' 
                : 'other'
          }`}
          style={{ position: 'relative' }}
        >
          {!message.system && (
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.7, 
              marginBottom: '4px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>
                {message.sender}
                {message.isPrivate && (
                  <span style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '10px',
                    marginLeft: '8px'
                  }}>
                    Private
                  </span>
                )}
              </span>
              <span>{formatTime(message.timestamp)}</span>
            </div>
          )}
          
          <div>{message.message}</div>

          {/* Read receipts for own messages */}
          {!message.system && message.sender === currentUser && message.readBy && message.readBy.length > 1 && (
            <div style={{ 
              fontSize: '10px', 
              color: '#6c757d',
              marginTop: '4px',
              textAlign: 'right'
            }}>
              ✓✓ Read by {message.readBy.length - 1} user{message.readBy.length !== 2 ? 's' : ''}
            </div>
          )}

          {/* Reactions */}
          {!message.system && message.reactions && Object.keys(message.reactions).length > 0 && (
            <div style={{ 
              marginTop: '8px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px'
            }}>
              {Object.entries(message.reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(message.id, emoji)}
                  style={{
                    background: users.some(user => user.username === currentUser) 
                      ? 'rgba(0, 123, 255, 0.2)' 
                      : 'rgba(0,0,0,0.1)',
                    border: users.some(user => user.username === currentUser)
                      ? '1px solid #007bff'
                      : '1px solid transparent',
                    borderRadius: '12px',
                    padding: '2px 6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                  title={users.map(user => user.username).join(', ')}
                >
                  {emoji} {users.length}
                </button>
              ))}
            </div>
          )}

          {/* Reaction picker */}
          {!message.system && (
            <div style={{ 
              position: 'absolute',
              top: 0,
              right: message.sender === currentUser ? 'auto' : '10px',
              left: message.sender === currentUser ? '10px' : 'auto',
              opacity: 0,
              transition: 'opacity 0.2s'
            }}
            className="reaction-trigger"
            >
              <button
                onClick={() => toggleReactionPicker(message.id)}
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="React to this message"
              >
                😊
              </button>

              {showReactions[message.id] && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  gap: '4px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  zIndex: 1000
                }}>
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(message.id, emoji)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f0f0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <style>
        {`
          .message:hover .reaction-trigger {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
};

export default MessageList;
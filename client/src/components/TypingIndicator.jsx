import React from 'react';

const TypingIndicator = ({ typingUsers, currentUser }) => {
  // Filter out current user from typing users
  const otherTypingUsers = typingUsers.filter(user => user !== currentUser);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0]} is typing...`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0]} and ${otherTypingUsers[1]} are typing...`;
    } else {
      return `${otherTypingUsers[0]} and ${otherTypingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="typing-indicator">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          <div 
            style={{ 
              width: '6px', 
              height: '6px', 
              backgroundColor: '#007bff', 
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '-0.32s'
            }}
          />
          <div 
            style={{ 
              width: '6px', 
              height: '6px', 
              backgroundColor: '#007bff', 
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '-0.16s'
            }}
          />
          <div 
            style={{ 
              width: '6px', 
              height: '6px', 
              backgroundColor: '#007bff', 
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both'
            }}
          />
        </div>
        <span>{getTypingText()}</span>
      </div>
      
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            } 40% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default TypingIndicator;
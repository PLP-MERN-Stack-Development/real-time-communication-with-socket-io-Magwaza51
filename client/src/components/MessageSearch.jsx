import React, { useState } from 'react';

const MessageSearch = ({ messages, onFilteredMessages }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setIsSearching(term.length > 0);
    
    if (term.length === 0) {
      onFilteredMessages(null); // Show all messages
      return;
    }

    const filtered = messages.filter(message => 
      message.message?.toLowerCase().includes(term.toLowerCase()) ||
      message.sender?.toLowerCase().includes(term.toLowerCase())
    );
    
    onFilteredMessages(filtered);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    onFilteredMessages(null);
  };

  return (
    <div style={{ 
      padding: '10px 20px', 
      borderBottom: '1px solid #ddd',
      background: '#f8f9fa'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search messages or users..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        {isSearching && (
          <button
            onClick={clearSearch}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>
      {isSearching && (
        <div style={{ 
          fontSize: '12px', 
          color: '#6c757d', 
          marginTop: '5px' 
        }}>
          {onFilteredMessages && `Search results for "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;
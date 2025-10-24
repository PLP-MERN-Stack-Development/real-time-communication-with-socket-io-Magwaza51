import React from 'react';

const UserList = ({ users, currentUser, onPrivateMessage }) => {
  const otherUsers = users.filter(user => user.username !== currentUser);

  return (
    <div>
      <h4 style={{ marginBottom: '10px' }}>
        Online Users ({users.length})
      </h4>
      
      <ul className="user-list">
        {/* Current user */}
        <li style={{ 
          background: 'rgba(52, 152, 219, 0.2)', 
          borderRadius: '4px',
          padding: '8px',
          marginBottom: '5px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#27ae60', 
              borderRadius: '50%' 
            }}></span>
            <span style={{ fontWeight: 'bold' }}>{currentUser} (You)</span>
          </div>
        </li>

        {/* Other users */}
        {otherUsers.map((user) => (
          <li 
            key={user.id}
            style={{ 
              borderRadius: '4px',
              padding: '8px',
              marginBottom: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            onClick={() => onPrivateMessage(user)}
            title={`Click to send private message to ${user.username}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: '#27ae60', 
                  borderRadius: '50%' 
                }}></span>
                <span>{user.username}</span>
              </div>
              <span style={{ 
                fontSize: '12px', 
                opacity: 0.7,
                background: 'rgba(255,255,255,0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                💬
              </span>
            </div>
          </li>
        ))}
      </ul>

      {otherUsers.length === 0 && (
        <div style={{ 
          fontSize: '14px', 
          color: '#bdc3c7', 
          fontStyle: 'italic',
          textAlign: 'center',
          padding: '20px 0'
        }}>
          No other users online
        </div>
      )}

      <div style={{ 
        fontSize: '12px', 
        color: '#95a5a6', 
        marginTop: '15px',
        padding: '10px',
        background: 'rgba(0,0,0,0.1)',
        borderRadius: '4px'
      }}>
        💡 Click on any user to start a private conversation
      </div>
    </div>
  );
};

export default UserList;
import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (username.length < 2) {
      setError('Username must be at least 2 characters long');
      return;
    }
    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    setError('');
    onLogin(username.trim());
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Welcome to Socket.io Chat
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%' }}
            autoFocus
          />
        </div>

        {error && (
          <div style={{ 
            color: '#dc3545', 
            marginBottom: '15px', 
            fontSize: '14px',
            textAlign: 'center' 
          }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          style={{ 
            width: '100%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px'
          }}
        >
          Join Chat
        </button>

        <div style={{ 
          marginTop: '20px', 
          fontSize: '12px', 
          color: '#666',
          textAlign: 'center' 
        }}>
          Enter a username to start chatting with others in real-time!
        </div>
      </form>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { useSocket } from './socket/socket';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import './index.css';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isConnected, connect, disconnect } = useSocket();

  const handleLogin = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
    connect(name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    disconnect();
  };

  useEffect(() => {
    // Check if user was previously logged in
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
      connect(savedUsername);
    }
  }, []);

  useEffect(() => {
    // Save username to localStorage
    if (username) {
      localStorage.setItem('chatUsername', username);
    } else {
      localStorage.removeItem('chatUsername');
    }
  }, [username]);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      <ChatRoom username={username} onLogout={handleLogout} />
    </div>
  );
}

export default App;
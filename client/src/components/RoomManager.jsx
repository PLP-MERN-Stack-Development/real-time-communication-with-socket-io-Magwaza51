import React, { useState } from 'react';

const RoomManager = ({ currentRoom, onRoomChange, onCreateRoom }) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [rooms] = useState([
    { id: 'general', name: 'General', description: 'Main chat room' },
    { id: 'random', name: 'Random', description: 'Off-topic discussions' },
    { id: 'tech', name: 'Tech Talk', description: 'Technology discussions' },
    { id: 'announcements', name: 'Announcements', description: 'Important updates' }
  ]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    const roomId = newRoomName.toLowerCase().replace(/\s+/g, '-');
    const newRoom = {
      id: roomId,
      name: newRoomName.trim(),
      description: 'Custom room'
    };
    
    onCreateRoom(newRoom);
    setNewRoomName('');
    setShowCreateForm(false);
    onRoomChange(roomId);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h4>Chat Rooms</h4>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          title="Create new room"
        >
          +
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Room name..."
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              marginBottom: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            maxLength={20}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              type="submit"
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewRoomName('');
              }}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div>
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onRoomChange(room.id)}
            style={{
              width: '100%',
              background: currentRoom === room.id ? '#3498db' : '#34495e',
              color: 'white',
              border: 'none',
              padding: '8px',
              marginBottom: '5px',
              textAlign: 'left',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title={room.description}
          >
            # {room.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomManager;
import React, { useState } from 'react';

const FileUpload = ({ onFileSelect, onCancel }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (files) => {
    const file = files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only images, text files, and PDFs are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onFileSelect({
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>
          Share a File
        </h3>
        
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? '#007bff' : '#ddd'}`,
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: dragActive ? '#f8f9fa' : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📎</div>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Drag and drop a file here, or click to select
          </p>
          <input
            type="file"
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
            id="file-input"
            accept="image/*,.txt,.pdf"
          />
          <label
            htmlFor="file-input"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-block',
              marginBottom: '10px'
            }}
          >
            Choose File
          </label>
          <p style={{ fontSize: '12px', color: '#999' }}>
            Max size: 5MB • Supported: Images, Text, PDF
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '20px' 
        }}>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
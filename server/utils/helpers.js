// utils/helpers.js - Utility functions for the chat application

/**
 * Generate a unique user ID for guest users
 * @returns {string} Unique user ID
 */
const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a unique message ID
 * @returns {number} Unique message ID
 */
const generateMessageId = () => {
  return Date.now();
};

/**
 * Validate username format
 * @param {string} username 
 * @returns {boolean} True if valid, false otherwise
 */
const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  
  // Username must be 2-30 characters, alphanumeric with underscores and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{2,30}$/;
  return usernameRegex.test(username.trim());
};

/**
 * Validate room ID format
 * @param {string} roomId 
 * @returns {boolean} True if valid, false otherwise
 */
const isValidRoomId = (roomId) => {
  if (!roomId || typeof roomId !== 'string') return false;
  
  // Room ID must be 1-50 characters, lowercase alphanumeric with hyphens
  const roomIdRegex = /^[a-z0-9-]{1,50}$/;
  return roomIdRegex.test(roomId.trim());
};

/**
 * Sanitize message content
 * @param {string} content 
 * @returns {string} Sanitized content
 */
const sanitizeMessage = (content) => {
  if (!content || typeof content !== 'string') return '';
  
  // Remove potentially harmful HTML/script tags
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
  
  // Limit message length
  return sanitized.substring(0, 1000);
};

/**
 * Format timestamp for display
 * @param {Date|string} timestamp 
 * @returns {string} Formatted timestamp
 */
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  
  return date.toISOString();
};

/**
 * Check if a user is online
 * @param {Object} user User object
 * @returns {boolean} True if online, false otherwise
 */
const isUserOnline = (user) => {
  if (!user) return false;
  
  const now = new Date();
  const lastSeen = new Date(user.lastSeen || user.updatedAt);
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  return user.status === 'online' || lastSeen > fiveMinutesAgo;
};

/**
 * Get user display name
 * @param {Object} user User object
 * @returns {string} Display name
 */
const getUserDisplayName = (user) => {
  if (!user) return 'Anonymous';
  return user.displayName || user.username || 'Anonymous';
};

/**
 * Validate message reaction emoji
 * @param {string} emoji 
 * @returns {boolean} True if valid emoji
 */
const isValidEmoji = (emoji) => {
  if (!emoji || typeof emoji !== 'string') return false;
  
  // Basic emoji validation - allows Unicode emoji
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(emoji) && emoji.length <= 4;
};

/**
 * Calculate time difference for display
 * @param {Date|string} timestamp 
 * @returns {string} Human readable time difference
 */
const getTimeDifference = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now - time;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Generate room invite code
 * @returns {string} Random invite code
 */
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Truncate text to specified length
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string} Truncated text
 */
const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Check if MongoDB is connected
 * @returns {boolean} True if connected
 */
const isMongoConnected = () => {
  return global.mongoConnected === true;
};

/**
 * Rate limiting helper
 * @param {string} userId 
 * @param {number} limit 
 * @param {number} windowMs 
 * @returns {boolean} True if within rate limit
 */
const checkRateLimit = (userId, limit = 10, windowMs = 60000) => {
  if (!global.rateLimitMap) {
    global.rateLimitMap = new Map();
  }
  
  const now = Date.now();
  const userRequests = global.rateLimitMap.get(userId) || [];
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= limit) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  validRequests.push(now);
  global.rateLimitMap.set(userId, validRequests);
  
  return true; // Within rate limit
};

module.exports = {
  generateUserId,
  generateMessageId,
  isValidUsername,
  isValidRoomId,
  sanitizeMessage,
  formatTimestamp,
  isUserOnline,
  getUserDisplayName,
  isValidEmoji,
  getTimeDifference,
  generateInviteCode,
  truncateText,
  isMongoConnected,
  checkRateLimit
};
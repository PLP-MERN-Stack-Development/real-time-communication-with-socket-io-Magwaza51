// context/ChatContext.jsx - Chat state management context

import React, { createContext, useContext, useReducer, useCallback } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Chat state reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };

    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'UPDATE_MESSAGE_REACTION':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, reactions: action.payload.reactions }
            : msg
        ),
      };

    case 'SET_USERS':
      return { ...state, users: action.payload };

    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users.filter(u => u.id !== action.payload.id), action.payload],
      };

    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload.id),
      };

    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.payload };

    case 'ADD_PRIVATE_MESSAGE':
      return {
        ...state,
        privateMessages: [...state.privateMessages, action.payload],
      };

    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };

    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  currentRoom: 'general',
  rooms: [],
  messages: [],
  users: [],
  typingUsers: [],
  privateMessages: [],
  searchResults: [],
  isOnline: false,
  loading: false,
  error: null,
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Action creators
  const setUser = useCallback((user) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const setCurrentRoom = useCallback((room) => {
    dispatch({ type: 'SET_CURRENT_ROOM', payload: room });
  }, []);

  const setRooms = useCallback((rooms) => {
    dispatch({ type: 'SET_ROOMS', payload: rooms });
  }, []);

  const addMessage = useCallback((message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const setMessages = useCallback((messages) => {
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  }, []);

  const updateMessageReaction = useCallback((messageId, reactions) => {
    dispatch({ 
      type: 'UPDATE_MESSAGE_REACTION', 
      payload: { messageId, reactions } 
    });
  }, []);

  const setUsers = useCallback((users) => {
    dispatch({ type: 'SET_USERS', payload: users });
  }, []);

  const addUser = useCallback((user) => {
    dispatch({ type: 'ADD_USER', payload: user });
  }, []);

  const removeUser = useCallback((user) => {
    dispatch({ type: 'REMOVE_USER', payload: user });
  }, []);

  const setTypingUsers = useCallback((users) => {
    dispatch({ type: 'SET_TYPING_USERS', payload: users });
  }, []);

  const addPrivateMessage = useCallback((message) => {
    dispatch({ type: 'ADD_PRIVATE_MESSAGE', payload: message });
  }, []);

  const setSearchResults = useCallback((results) => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
  }, []);

  const setOnlineStatus = useCallback((status) => {
    dispatch({ type: 'SET_ONLINE_STATUS', payload: status });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    // State
    ...state,
    
    // Actions
    setUser,
    setCurrentRoom,
    setRooms,
    addMessage,
    setMessages,
    updateMessageReaction,
    setUsers,
    addUser,
    removeUser,
    setTypingUsers,
    addPrivateMessage,
    setSearchResults,
    setOnlineStatus,
    setLoading,
    setError,
    clearError,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
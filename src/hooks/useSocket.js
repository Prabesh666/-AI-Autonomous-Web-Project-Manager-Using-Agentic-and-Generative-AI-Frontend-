import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api/index';

let socketInstance = null;

/**
 * Returns a singleton Socket.io client instance.
 */
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(API_BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socketInstance;
};

/**
 * useSocket — React hook for real-time Socket.io events.
 * @param {string} projectId   — Join the project room for project-specific events.
 * @param {object} handlers    — Map of { eventName: callbackFn }
 *
 * Usage:
 *   useSocket(projectId, {
 *     task_completed: (data) => console.log('Task done!', data),
 *   });
 */
const useSocket = (projectId, handlers = {}) => {
  const socket = getSocket();
  const handlersRef = useRef(handlers);

  // Keep latest handlers without re-subscribing
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    // Join user + project rooms
    const userId = JSON.parse(localStorage.getItem('user') || '{}')._id;
    if (userId) socket.emit('join', userId);
    if (projectId) socket.emit('join_project', projectId);

    // Register all event handlers
    const activeEvents = Object.keys(handlersRef.current);
    activeEvents.forEach((event) => {
      socket.on(event, (data) => handlersRef.current[event]?.(data));
    });

    return () => {
      // Cleanup listeners on unmount
      activeEvents.forEach((event) => socket.off(event));
    };
  }, [projectId]);

  const emit = useCallback((event, data) => {
    socket.emit(event, data);
  }, []);

  return { emit, socket };
};

export default useSocket;

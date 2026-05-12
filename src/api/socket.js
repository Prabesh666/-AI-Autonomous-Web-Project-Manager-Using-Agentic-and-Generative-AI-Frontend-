import { io } from 'socket.io-client';
import { API_BASE_URL } from './index';

/**
 * Socket.io Client Implementation for 0.001% UX connectivity.
 * This establishes the bi-directional neural bridge between the 
 * autonomous backend and the Sentient HUD.
 */

const SOCKET_URL = API_BASE_URL;

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit('join', userId);
  }
};

export const joinProjectRoom = (projectId) => {
  if (socket.connected) {
    socket.emit('join_project', projectId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;

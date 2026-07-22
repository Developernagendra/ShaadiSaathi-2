import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '').replace('/api', '') || 'https://shaadisaathi-backend.onrender.com';

const AuthSoundListener = () => {

  useEffect(() => {
    // Connect to the Socket.IO server
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('🔊 AuthSoundListener connected to socket:', socket.id);
    });

    socket.on('auth-event', (data) => {
      if (!data || !data.type) return;

      const { type, message } = data;
      let soundFile = '';
      let soundCategory = '';

      // Map event type to sound file
      switch (type) {
        case 'USER_LOGIN':
        case 'VENDOR_LOGIN':
        case 'VENDOR_REGISTER':
          soundFile = '/sounds/success.mp3';
          soundCategory = 'success';
          break;
        case 'USER_LOGOUT':
          soundFile = '/sounds/logout.mp3';
          soundCategory = 'logout';
          break;
        case 'ADMIN_ACTION':
          soundFile = '/sounds/alert.mp3';
          soundCategory = 'alert';
          break;
        default:
          return; // Ignore unknown events
      }

      // Show Toast Notification
      if (message) {
        // Customize toast based on category
        if (soundCategory === 'success') {
          toast.success(`${message} 🎉`, { id: type });
        } else if (soundCategory === 'logout') {
          toast(`${message} 👋`, { icon: 'ℹ️', id: type });
        } else if (soundCategory === 'alert') {
          toast(`${message} ⚡`, { icon: '🔔', id: type });
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return null; // Headless component
};

export default AuthSoundListener;

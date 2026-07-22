let io;

// Construct the allowed origins list for Socket.IO CORS —
// mirrors the Express CORS configuration in index.js
const getAllowedOrigins = () => {
  const origins = [
    'https://shaadi-saathi.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
  ];

  if (process.env.CLIENT_URL) {
    const strippedUrl = process.env.CLIENT_URL.replace(/\/$/, '');
    if (!origins.includes(strippedUrl)) {
      origins.push(strippedUrl);
    }
  }

  return origins;
};

module.exports = {
  init: (serverInstance) => {
    const { Server } = require('socket.io');
    const allowedOrigins = getAllowedOrigins();

    io = new Server(serverInstance, {
      cors: {
        origin: function (origin, callback) {
          // Allow server-to-server / no-origin requests (e.g. health checks)
          if (!origin) return callback(null, true);

          const isAllowed =
            allowedOrigins.includes(origin) ||
            /https:\/\/shaadi-saathi(-[a-z0-9-]+)?\.vercel\.app/.test(origin) ||
            /https:\/\/shaadisaathi(-[a-z0-9-]+)?\.vercel\.app/.test(origin);

          // In non-production, also allow private/LAN network IPs
          const isPrivateNetwork = process.env.NODE_ENV !== 'production' &&
            /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);

          if (isAllowed || isPrivateNetwork) {
            callback(null, true);
          } else {
            console.warn(`⚠️ Socket.IO CORS BLOCKED for origin: ${origin}`);
            callback(new Error('Socket connection not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    return io;
  },
  getSocket: () => {
    if (!io) {
      console.warn('⚠️ Socket.io not initialized yet.');
    }
    return io;
  }
};

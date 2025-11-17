const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { randomBytes } = require('crypto');
const path = require('path');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '4000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const REDIS_URL = process.env.REDIS_URL;

console.log(`Starting server in ${dev ? 'development' : 'production'} mode on port ${port}`);

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Create Express server
const server = express();
server.set('trust proxy', true);
server.use(express.json({ limit: '64kb' }));
server.use(compression());
server.use(cors({ 
  origin: dev ? true : CORS_ORIGIN, 
  credentials: true 
}));

// Handle CORS preflight
server.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const reqOrigin = req.headers.origin || CORS_ORIGIN;
    res.header('Access-Control-Allow-Origin', dev ? reqOrigin : CORS_ORIGIN);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    const reqHeaders = req.headers['access-control-request-headers'];
    res.header('Access-Control-Allow-Headers', Array.isArray(reqHeaders) ? reqHeaders.join(',') : reqHeaders || 'Content-Type');
    return res.sendStatus(204);
  }
  next();
});

server.use(
  helmet({
    contentSecurityPolicy: dev ? false : {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", 'data:', 'https:'],
        "connect-src": ["'self'", CORS_ORIGIN, `ws://${hostname}:${port}`, `wss://${hostname}:${port}`],
        "font-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
server.use('/api', limiter);

// Create HTTP server
const httpServer = createServer(server);

// Create Socket.io server
const io = new Server(httpServer, {
  cors: { 
    origin: dev ? true : CORS_ORIGIN, 
    methods: ['GET', 'POST'] 
  },
  path: '/ws',
  maxHttpBufferSize: 10 * 1024 * 1024,
});

// Redis setup
let redis;
let useMemoryStore = false;
const memRooms = new Map();

async function initRedis() {
  if (!REDIS_URL) {
    useMemoryStore = true;
    console.warn('[server] REDIS_URL not set; using in-memory store.');
    return;
  }
  try {
    redis = createClient({ url: REDIS_URL });
    redis.on('error', (err) => console.error('[redis] error', err));
    await redis.connect();
    console.log('[redis] connected');
  } catch (e) {
    console.warn('[server] Redis unavailable, falling back to memory store:', e?.message || e);
    useMemoryStore = true;
  }
}

function ttlToSeconds(ttl) {
  const map = {
    '5min': 300, '15min': 900, '30min': 1800, '1h': 3600,
    '6h': 21600, '24h': 86400, '5m': 300, '15m': 900, '30m': 1800,
  };
  if (typeof ttl === 'number') return ttl;
  if (!ttl) return 900;
  return map[ttl] ?? 900;
}

function genRoomId() {
  return randomBytes(9).toString('base64url');
}

// API Routes
server.post('/api/room', (req, res) => {
  const { ttl = '30min', burnAfterReading = false, maxParticipants = 2 } = req.body || {};
  const roomId = genRoomId();
  const ttlSeconds = ttlToSeconds(ttl);
  const settings = {
    ttl: ttlSeconds,
    burnAfterReading: !!burnAfterReading,
    maxParticipants: Math.min(50, Number(maxParticipants) || 2),
    createdAt: Date.now(),
  };

  if (useMemoryStore) {
    memRooms.set(roomId, { settings, participants: new Set(), messages: [] });
    setTimeout(() => memRooms.delete(roomId), ttlSeconds * 1000);
    return res.json({ roomId, settings });
  }

  const key = `room:${roomId}`;
  redis.set(key, JSON.stringify({ settings }), { EX: ttlSeconds });
  return res.json({ roomId, settings });
});

server.get('/api/room/:roomId', async (req, res) => {
  const { roomId } = req.params;
  if (useMemoryStore) {
    const room = memRooms.get(roomId);
    if (!room) return res.status(404).json({ error: 'not_found' });
    const participants = room.participants?.size || 0;
    const { settings } = room;
    const expiresAt = settings.createdAt + settings.ttl * 1000;
    return res.json({ roomId, settings, participants, expiresAt });
  }
  try {
    const key = `room:${roomId}`;
    const raw = await redis.get(key);
    if (!raw) return res.status(404).json({ error: 'not_found' });
    const parsed = JSON.parse(raw);
    const settings = parsed?.settings || {};
    const expiresAt = typeof settings.createdAt === 'number' && typeof settings.ttl === 'number'
      ? settings.createdAt + settings.ttl * 1000
      : undefined;
    return res.json({ roomId, settings, participants: 0, expiresAt });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

server.get('/health', (_req, res) => res.json({ ok: true }));

// WebSocket events
io.on('connection', (socket) => {
  socket.on('join-room', async ({ roomId, userId }) => {
    if (!roomId) return;
    socket.join(roomId);
    if (useMemoryStore) {
      const room = memRooms.get(roomId) || {
        settings: { ttl: 1800, burnAfterReading: false, maxParticipants: 2, createdAt: Date.now() },
        participants: new Set(),
        messages: [],
      };
      room.participants.add(socket.id);
      memRooms.set(roomId, room);
      const count = room.participants.size;
      socket.emit('room-joined', { roomId, settings: room.settings, participants: count });
      socket.to(roomId).emit('participant-count', { count });
    } else {
      socket.emit('room-joined', { roomId });
    }
    io.to(roomId).emit('user-joined', { userId: socket.id });
  });

  socket.on('send-message', async ({ roomId, message }) => {
    if (!roomId || !message) return;
    io.to(roomId).emit('new-message', {
      roomId, message,
      id: randomBytes(6).toString('base64url'),
      ts: Date.now(),
      from: socket.id,
    });
  });

  socket.on('typing', ({ roomId, isTyping }) => {
    if (!roomId) return;
    socket.to(roomId).emit('typing-status', { userId: socket.id, isTyping: !!isTyping });
  });

  socket.on('message-burned', ({ roomId, id }) => {
    if (!roomId || !id) return;
    io.to(roomId).emit('message-burned', { id, by: socket.id });
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        if (useMemoryStore) {
          const room = memRooms.get(roomId);
          if (room?.participants) {
            room.participants.delete(socket.id);
            memRooms.set(roomId, room);
            const count = room.participants.size;
            socket.to(roomId).emit('participant-count', { count });
          }
        }
        socket.to(roomId).emit('user-left', { userId: socket.id });
      }
    }
  });
});

// Serve static files
server.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  immutable: true
}));

// Handle all other requests with Next.js
server.all('*', (req, res) => {
  return handle(req, res);
});

// Start the server
app.prepare().then(async () => {
  await initRedis();
  
  httpServer.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server on ws://${hostname}:${port}/ws`);
  });
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  if (redis) {
    await redis.quit();
  }
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

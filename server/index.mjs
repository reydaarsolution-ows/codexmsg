import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';
const REDIS_URL = process.env.REDIS_URL;

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '64kb' }));
app.use(compression());
app.use(cors({ origin: NODE_ENV === 'development' ? true : CORS_ORIGIN, credentials: true }));
// Handle CORS preflight generically without wildcard path (Express 5 safe)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const reqOrigin = req.headers.origin || CORS_ORIGIN;
    res.header('Access-Control-Allow-Origin', NODE_ENV === 'development' ? reqOrigin : CORS_ORIGIN);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    const reqHeaders = req.headers['access-control-request-headers'];
    res.header('Access-Control-Allow-Headers', Array.isArray(reqHeaders) ? reqHeaders.join(',') : reqHeaders || 'Content-Type');
    return res.sendStatus(204);
  }
  next();
});
app.use(
  helmet({
    contentSecurityPolicy:
      NODE_ENV === 'production'
        ? {
            useDefaults: true,
            directives: {
              "default-src": ["'self'"],
              "script-src": ["'self'"],
              "style-src": ["'self'", "'unsafe-inline'"],
              "img-src": ["'self'", 'data:'],
              "connect-src": ["'self'", CORS_ORIGIN, `ws://localhost:${PORT}`, `wss://localhost:${PORT}`],
              "font-src": ["'self'"],
              "object-src": ["'none'"],
              "base-uri": ["'self'"],
              "frame-ancestors": ["'none'"],
            },
          }
        : false,
    crossOriginEmbedderPolicy: false,
  })
);

const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 20, // flood protection: 20 requests per 10s
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: NODE_ENV === 'development' ? true : CORS_ORIGIN, methods: ['GET', 'POST'] },
  path: '/ws',
  maxHttpBufferSize: 10 * 1024 * 1024, // allow up to 10MB payloads for attachments
});

let redis;
let useMemoryStore = false;
const memRooms = new Map(); // roomId -> { settings, participants:Set, messages: [] }

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
initRedis();

function ttlToSeconds(ttl) {
  const map = {
    '5min': 300,
    '15min': 900,
    '30min': 1800,
    '1h': 3600,
    '6h': 21600,
    '24h': 86400,
    '5m': 300,
    '15m': 900,
    '30m': 1800,
  };
  if (typeof ttl === 'number') return ttl;
  if (!ttl) return 900;
  return map[ttl] ?? 900;
}

function genRoomId() {
  return randomBytes(9).toString('base64url'); // ~12 chars
}

// Create room
app.post('/api/room', (req, res) => {
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

// Get room
app.get('/api/room/:roomId', async (req, res) => {
  const { roomId } = req.params;
  if (useMemoryStore) {
    const room = memRooms.get(roomId);
    if (!room) return res.status(404).json({ error: 'not_found' });
    const participants = room.participants?.size || 0;
    const { settings } = room;
    const expiresAt = settings.createdAt + settings.ttl * 1000;
    return res.json({ roomId, settings, participants, expiresAt });
  }
  // Redis-backed: fetch settings
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

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

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
      // Notify this socket with settings and count
      socket.emit('room-joined', { roomId, settings: room.settings, participants: count });
      // Broadcast participant count to others
      socket.to(roomId).emit('participant-count', { count });
    } else {
      // Fallback notify without settings/count (client may fetch via REST)
      socket.emit('room-joined', { roomId });
    }
    io.to(roomId).emit('user-joined', { userId: socket.id });
  });

  socket.on('send-message', async ({ roomId, message }) => {
    if (!roomId || !message) return;
    io.to(roomId).emit('new-message', {
      roomId,
      message, // encrypted payload; do not log
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

server.listen(PORT, () => {
  console.log(`Secure Messenger server listening on http://localhost:${PORT}`);
});

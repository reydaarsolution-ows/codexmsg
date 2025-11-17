"use client";
import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const path = process.env.NEXT_PUBLIC_SOCKET_PATH || '/ws';
    socket = io(url, { path, transports: ['websocket'] });
  }
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

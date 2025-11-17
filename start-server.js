// This script will help start the backend server with proper environment variables
const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.PORT = '4000';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.NODE_ENV = 'development';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

console.log('Starting server with configuration:');
console.log(`- PORT: ${process.env.PORT}`);
console.log(`- CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- REDIS_URL: ${process.env.REDIS_URL}`);

// Start the server
const server = spawn('node', ['--experimental-specifier-resolution=node', 'server/index.mjs'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill('SIGINT');
  process.exit(0);
});

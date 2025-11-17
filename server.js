const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Create Express server
const server = express();

// Security middleware
server.use(helmet());
server.use(compression());

// Serve static files from the public folder
server.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  immutable: true
}));

// Handle all other requests with Next.js
server.all('*', (req, res) => {
  return handle(req, res);
});

// Start the server
app.prepare().then(() => {
  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  process.exit(0);
});

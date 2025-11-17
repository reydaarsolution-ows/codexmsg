@echo off
set PORT=4000
set CORS_ORIGIN=http://localhost:3000
set NODE_ENV=development
set REDIS_URL=redis://localhost:6379

echo Starting Codexone Backend Server...
echo Port: %PORT%
echo CORS Origin: %CORS_ORIGIN%
echo NODE_ENV: %NODE_ENV%

node --experimental-specifier-resolution=node server/index.mjs

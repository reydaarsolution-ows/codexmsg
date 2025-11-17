@echo off
echo Installing dependencies...
call npm install

echo Starting development server on port 3001...
set NEXT_PUBLIC_API_URL=http://localhost:4000
call npm run dev

pause

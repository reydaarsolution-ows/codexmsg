# MsgXone - Secure Ephemeral Messaging

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MsgXone is a secure, ephemeral messaging platform built with Next.js, TypeScript, and WebSockets. Messages are end-to-end encrypted and automatically deleted after reading or after a set time period.

## Features

- 🔒 End-to-end encryption
- ⚡ Real-time messaging
- 🚀 Built with Next.js 14+ and TypeScript
- 🎨 Responsive design
- 🔥 Message auto-destruction
- 🔄 WebSocket-based real-time updates

## Prerequisites

- Node.js 18+ and npm 8+
- Redis (for production)
- Domain name with SSL certificate (for production)

## Getting Started

### Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/msgxone.git
   cd msgxone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.sample`:
   ```bash
   cp .env.sample .env
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Production Deployment

### 1. Server Setup

1. Create a new server with Node.js 18+ and install Redis:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install -y nodejs npm redis-server
   ```

2. Clone the repository to your server:
   ```bash
   git clone https://github.com/yourusername/msgxone.git
   cd msgxone
   ```

### 2. Configuration

1. Create a production `.env` file:
   ```bash
   cp production.env.example .env.production
   ```

2. Edit the `.env.production` file with your production settings:
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.codexone.online
   NEXT_PUBLIC_SOCKET_URL=wss://ws.codexone.online
   NEXT_PUBLIC_SOCKET_PATH=/ws
   PORT=3000
   CORS_ORIGIN=https://www.codexone.online
   REDIS_URL=redis://localhost:6379
   COOKIE_SECRET=your_secure_cookie_secret
   ENCRYPTION_KEY=your_32_character_encryption_key
   ```

### 3. Installation & Build

1. Install dependencies:
   ```bash
   npm ci --production
   ```

2. Build the application:
   ```bash
   npm run build:prod
   ```

### 4. Running in Production

#### Option 1: Using PM2 (Recommended)

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Start the application with PM2:
   ```bash
   pm2 start npm --name "msgxone" -- start
   ```

3. Set PM2 to start on boot:
   ```bash
   pm2 startup
   pm2 save
   ```

#### Option 2: Using Systemd

1. Create a systemd service file at `/etc/systemd/system/msgxone.service`:
   ```ini
   [Unit]
   Description=MsgXone Secure Messenger
   After=network.target redis.service

   [Service]
   User=your_username
   WorkingDirectory=/path/to/msgxone
   Environment=NODE_ENV=production
   ExecStart=/usr/bin/npm start
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

2. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable msgxone
   sudo systemctl start msgxone
   ```

### 5. Reverse Proxy Setup (Nginx)

1. Install Nginx:
   ```bash
   sudo apt install -y nginx
   ```

2. Create a new Nginx configuration at `/etc/nginx/sites-available/msgxone`:
   ```nginx
   # HTTP to HTTPS redirect
   server {
       listen 80;
       server_name codexone.online www.codexone.online api.codexone.online ws.codexone.online;
       return 301 https://$host$request_uri;
   }

   # Main server block
   server {
       listen 443 ssl http2;
       server_name www.codexone.online;

       ssl_certificate /path/to/ssl/cert.pem;
       ssl_certificate_key /path/to/ssl/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }

   # API subdomain
   server {
       listen 443 ssl http2;
       server_name api.codexone.online;

       ssl_certificate /path/to/ssl/cert.pem;
       ssl_certificate_key /path/to/ssl/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }

   # WebSocket subdomain
   server {
       listen 443 ssl http2;
       server_name ws.codexone.online;

       ssl_certificate /path/to/ssl/cert.pem;
       ssl_certificate_key /path/to/ssl/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "Upgrade";
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. Enable the site and test the configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/msgxone /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 6. SSL Certificate

1. Install Certbot:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. Obtain and install SSL certificates:
   ```bash
   sudo certbot --nginx -d codexone.online -d www.codexone.online -d api.codexone.online -d ws.codexone.online
   ```

3. Set up automatic renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Application environment | Yes | `production` |
| `NEXT_PUBLIC_API_URL` | Public API URL | Yes | `http://localhost:4000` |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket URL | Yes | `ws://localhost:4000` |
| `NEXT_PUBLIC_SOCKET_PATH` | WebSocket path | No | `/ws` |
| `PORT` | Server port | No | `3000` |
| `CORS_ORIGIN` | Allowed CORS origins | Yes | `http://localhost:3001` |
| `REDIS_URL` | Redis connection string | No | `redis://localhost:6379` |
| `COOKIE_SECRET` | Secret for signing cookies | Yes |  |
| `ENCRYPTION_KEY` | 32-character encryption key | Yes |  |

## Monitoring

### PM2

- View logs: `pm2 logs msgxone`
- Monitor: `pm2 monit`
- Restart: `pm2 restart msgxone`

### Nginx

- Check status: `sudo systemctl status nginx`
- View logs: `sudo tail -f /var/log/nginx/error.log`

## Troubleshooting

- **Port in use**: Check for other processes using the same port: `sudo lsof -i :3000`
- **Redis connection issues**: Ensure Redis is running: `sudo systemctl status redis`
- **Build errors**: Clear Next.js cache: `rm -rf .next` and rebuild

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

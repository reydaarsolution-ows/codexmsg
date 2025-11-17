# Deploying to chat.codexone.online

Since this app requires WebSocket support for real-time messaging, here are your best deployment options:

## Option 1: Railway (Recommended - Easiest)

Railway supports both Next.js and WebSockets on the same service.

### Steps:

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Next.js

3. **Configure Environment Variables**
   ```
   NODE_ENV=production
   PORT=4000
   CORS_ORIGIN=https://chat.codexone.online
   NEXT_PUBLIC_SOCKET_URL=https://chat.codexone.online
   NEXT_PUBLIC_SOCKET_PATH=/ws
   ```

4. **Set Custom Domain**
   - In Railway dashboard, go to Settings → Domains
   - Click "Custom Domain"
   - Enter: `chat.codexone.online`
   - Add the CNAME record to your DNS:
     ```
     Type: CNAME
     Name: chat
     Value: [provided by Railway]
     ```

5. **Deploy**
   - Railway will automatically build and deploy
   - Your app will be live at https://chat.codexone.online

### Cost: 
- $5/month credit on free tier
- ~$5-10/month for production usage

---

## Option 2: Render

Render also supports full-stack Node.js apps with WebSockets.

### Steps:

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your repository
   - Select the branch

3. **Configure Service**
   - **Name**: secure-messenger
   - **Environment**: Node
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=4000
   CORS_ORIGIN=https://chat.codexone.online
   NEXT_PUBLIC_SOCKET_URL=https://chat.codexone.online
   NEXT_PUBLIC_SOCKET_PATH=/ws
   ```

5. **Set Custom Domain**
   - Go to Settings → Custom Domain
   - Add: `chat.codexone.online`
   - Update your DNS:
     ```
     Type: CNAME
     Name: chat
     Value: [provided by Render]
     ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Cost:
- Free tier available (with limitations)
- $7/month for starter plan

---

## Option 3: DigitalOcean App Platform

### Steps:

1. **Create DigitalOcean Account**
   - Go to https://www.digitalocean.com
   - Sign up and add payment method

2. **Create New App**
   - Go to Apps → Create App
   - Connect GitHub repository
   - Select repository and branch

3. **Configure App**
   - **Type**: Web Service
   - **Build Command**: `npm ci && npm run build`
   - **Run Command**: `npm run start:prod`
   - **HTTP Port**: 4000

4. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=4000
   CORS_ORIGIN=https://chat.codexone.online
   NEXT_PUBLIC_SOCKET_URL=https://chat.codexone.online
   NEXT_PUBLIC_SOCKET_PATH=/ws
   ```

5. **Add Custom Domain**
   - Settings → Domains
   - Add `chat.codexone.online`
   - Update DNS as instructed

### Cost:
- $5/month for basic plan

---

## Option 4: VPS (Full Control)

If you want complete control, deploy to a VPS (DigitalOcean Droplet, AWS EC2, etc.)

### Quick Setup:

1. **Get a VPS**
   - DigitalOcean Droplet ($6/month)
   - AWS Lightsail ($5/month)
   - Vultr ($6/month)

2. **Install Dependencies**
   ```bash
   # SSH into your server
   ssh root@your-server-ip

   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx

   # Install Certbot for SSL
   sudo apt install -y certbot python3-certbot-nginx
   ```

3. **Clone and Build**
   ```bash
   cd /var/www
   git clone your-repo-url secure-messenger
   cd secure-messenger
   npm ci
   npm run build
   ```

4. **Configure Environment**
   ```bash
   nano .env.production
   ```
   Add:
   ```
   NODE_ENV=production
   PORT=4000
   CORS_ORIGIN=https://chat.codexone.online
   NEXT_PUBLIC_SOCKET_URL=https://chat.codexone.online
   NEXT_PUBLIC_SOCKET_PATH=/ws
   ```

5. **Start with PM2**
   ```bash
   pm2 start npm --name "secure-messenger" -- run start:prod
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/chat.codexone.online
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name chat.codexone.online;

       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /ws {
           proxy_pass http://localhost:4000/ws;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/chat.codexone.online /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Get SSL Certificate**
   ```bash
   sudo certbot --nginx -d chat.codexone.online
   ```

8. **Update DNS**
   ```
   Type: A
   Name: chat
   Value: your-server-ip
   ```

---

## Recommended Choice

For `chat.codexone.online`, I recommend **Railway** because:
- ✅ Easiest setup (5 minutes)
- ✅ Automatic SSL
- ✅ WebSocket support out of the box
- ✅ Auto-deploys on git push
- ✅ Built-in monitoring
- ✅ Affordable ($5-10/month)

## Next Steps

1. Choose your deployment platform
2. Follow the steps above
3. Update your DNS records
4. Test the deployment

Need help with any specific platform? Let me know!

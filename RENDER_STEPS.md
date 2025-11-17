# Deploy to Render - Quick Guide

## Step 1: Push to GitHub

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

## Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended)

## Step 3: Deploy

### Option A: Using render.yaml (Automatic)

1. In Render dashboard, click **"New"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will detect `render.yaml` and configure everything automatically
4. Click **"Apply"**
5. Wait for deployment (5-10 minutes)

### Option B: Manual Setup

1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: secure-messenger
   - **Region**: Oregon (or closest to you)
   - **Branch**: main
   - **Root Directory**: (leave empty or `secure-messenger` if in subfolder)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

4. Add Environment Variables (click "Advanced"):

   ```
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=https://chat.codexone.online
   NEXT_PUBLIC_SOCKET_URL=https://chat.codexone.online
   NEXT_PUBLIC_SOCKET_PATH=/ws
   ```

5. Click **"Create Web Service"**

## Step 4: Add Custom Domain

1. Once deployed, go to your service dashboard
2. Click **"Settings"** → **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter: `chat.codexone.online`
5. Render will show you DNS records to add

## Step 5: Update DNS

Go to your domain registrar (where you bought codexone.online) and add:

**For CNAME (if chat is a subdomain):**
```
Type: CNAME
Name: chat
Value: [your-app].onrender.com (provided by Render)
TTL: 3600
```

**OR for A Record (if using apex domain):**
```
Type: A
Name: chat
Value: [IP address provided by Render]
TTL: 3600
```

## Step 6: Wait for SSL

- DNS propagation: 5-60 minutes
- Render will automatically provision SSL certificate
- Your app will be live at https://chat.codexone.online

## Step 7: Test

1. Visit https://chat.codexone.online
2. Create a room
3. Test messaging
4. Check WebSocket connection in DevTools

## Troubleshooting

**Build fails?**
- Check logs in Render dashboard
- Verify all dependencies are in package.json

**WebSocket not connecting?**
- Check NEXT_PUBLIC_SOCKET_URL matches your domain
- Verify CORS_ORIGIN is set correctly

**App crashes?**
- Check logs: Dashboard → Logs
- Verify environment variables are set

## Monitoring

- **Logs**: Dashboard → Logs tab
- **Metrics**: Dashboard → Metrics tab
- **Health Check**: https://chat.codexone.online/health

## Cost

- Free tier: Available with limitations (spins down after inactivity)
- Starter: $7/month (always on, better performance)

## Auto-Deploy

Render automatically deploys when you push to your main branch!

```bash
git add .
git commit -m "Update app"
git push origin main
```

Render will detect the push and redeploy automatically.

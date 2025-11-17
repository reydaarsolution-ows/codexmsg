# Vercel Deployment Guide

This guide explains how to deploy the Secure Messenger app with the frontend on Vercel and backend on a separate service.

## Architecture

- **Frontend (Next.js)**: Deployed on Vercel
- **Backend (Socket.io server)**: Deployed on Railway, Render, or similar service that supports WebSockets

## Prerequisites

1. Vercel account (https://vercel.com)
2. Railway/Render account for the backend (or any service supporting Node.js + WebSockets)
3. Git repository

## Step 1: Deploy Backend First

### Option A: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add these environment variables:
   ```
   PORT=4000
   NODE_ENV=production
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   REDIS_URL=(optional - Railway can provision Redis)
   ```
5. Set the start command: `node server/index.mjs`
6. Deploy and note your backend URL (e.g., `https://your-app.railway.app`)

### Option B: Deploy to Render

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.mjs`
   - **Environment Variables**:
     ```
     PORT=4000
     NODE_ENV=production
     CORS_ORIGIN=https://your-vercel-app.vercel.app
     REDIS_URL=(optional)
     ```
5. Deploy and note your backend URL

## Step 2: Deploy Frontend to Vercel

### Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project directory:
   ```bash
   cd secure-messenger
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **secure-messenger** (or your choice)
   - Directory? **./secure-messenger** (or just press Enter if already in the directory)
   - Override settings? **N**

5. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_SOCKET_URL
   ```
   Enter your backend URL (e.g., `https://your-app.railway.app`)

   ```bash
   vercel env add NEXT_PUBLIC_SOCKET_PATH
   ```
   Enter: `/ws`

6. Deploy to production:
   ```bash
   vercel --prod
   ```

### Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./secure-messenger` (if not at root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `NEXT_PUBLIC_SOCKET_URL`: Your backend URL (e.g., `https://your-app.railway.app`)
   - `NEXT_PUBLIC_SOCKET_PATH`: `/ws`

6. Click "Deploy"

## Step 3: Update CORS Settings

After deploying to Vercel, update your backend's CORS_ORIGIN environment variable:

1. Go to your backend service (Railway/Render)
2. Update `CORS_ORIGIN` to your Vercel URL: `https://your-app.vercel.app`
3. Redeploy the backend

## Step 4: Test the Deployment

1. Visit your Vercel URL
2. Create a new room
3. Test messaging functionality
4. Verify WebSocket connection in browser DevTools (Network tab → WS)

## Troubleshooting

### WebSocket Connection Failed

- Check that `NEXT_PUBLIC_SOCKET_URL` points to your backend
- Verify backend is running and accessible
- Check CORS settings on backend
- Ensure backend URL uses `https://` (not `http://`)

### Build Errors on Vercel

- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure `next.config.js` is properly configured

### Environment Variables Not Working

- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- After adding/changing env vars, redeploy the project
- Check that env vars are set for the correct environment (Production/Preview/Development)

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update backend's `CORS_ORIGIN` to your custom domain

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you push to other branches or open PRs

To disable auto-deployment:
1. Go to Project Settings → Git
2. Configure deployment branches

## Monitoring

- **Vercel Analytics**: Enable in project settings
- **Backend Logs**: Check Railway/Render dashboard
- **Error Tracking**: Consider adding Sentry or similar

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth, unlimited deployments
- **Railway**: $5/month credit on free tier
- **Render**: Free tier available with limitations

## Alternative: All-in-One Deployment

If you prefer deploying everything together, consider:
- **Railway**: Supports both Next.js and WebSockets
- **Render**: Can deploy full-stack apps
- **DigitalOcean App Platform**: Supports WebSockets
- **AWS/GCP/Azure**: Full control but more complex

See `DEPLOYMENT.md` for VPS deployment instructions.

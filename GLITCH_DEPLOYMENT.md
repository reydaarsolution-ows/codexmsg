# Deploy to Glitch (100% Free - No Credit Card)

## Option 1: Glitch for Backend Only

### Step 1: Create Glitch Project

1. Go to https://glitch.com
2. Click "Sign in" (use GitHub)
3. Click "New Project" → "Import from GitHub"
4. Paste: `https://github.com/reydaarsolution-ows/codexmsg`
5. Wait for import

### Step 2: Configure Glitch

1. Click on `.env` file in Glitch
2. Add these variables:
   ```
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://chat.codexone.online
   ```

3. Edit `package.json` in Glitch:
   - Find the `"start"` script
   - Change to: `"start": "node production-server.js"`

4. Click "Tools" → "Terminal" and run:
   ```bash
   npm install
   npm run build
   refresh
   ```

### Step 3: Get Your Glitch URL

Your backend will be at: `https://your-project-name.glitch.me`

### Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Import `reydaarsolution-ows/codexmsg`
4. Add environment variables:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-project-name.glitch.me
   NEXT_PUBLIC_SOCKET_PATH=/ws
   ```
5. Deploy

### Step 5: Add Custom Domain

**On Vercel:**
- Settings → Domains
- Add: `chat.codexone.online`
- Update DNS as instructed

**Update Glitch .env:**
```
CORS_ORIGIN=https://chat.codexone.online
```

### Limitations:
- Glitch sleeps after 5 minutes (wakes in ~10 seconds)
- 4000 hours/month free

---

## Option 2: Cyclic (Easiest - No Credit Card)

### Step 1: Deploy to Cyclic

1. Go to https://www.cyclic.sh
2. Sign in with GitHub
3. Click "Deploy"
4. Select: `reydaarsolution-ows/codexmsg`
5. Click "Connect"

### Step 2: Configure

Cyclic auto-detects Node.js. Just add environment variables:
```
NODE_ENV=production
CORS_ORIGIN=https://chat.codexone.online
NEXT_PUBLIC_SOCKET_URL=https://your-app.cyclic.app
NEXT_PUBLIC_SOCKET_PATH=/ws
```

### Step 3: Custom Domain

- Go to Settings → Domains
- Add: `chat.codexone.online`
- Update DNS

### Benefits:
- ✅ No credit card
- ✅ No sleep (always on!)
- ✅ WebSocket support
- ✅ Custom domain
- ✅ Free SSL

---

## Option 3: Koyeb (No Credit Card)

1. Go to https://www.koyeb.com
2. Sign up with GitHub
3. Deploy from GitHub
4. Add environment variables
5. Add custom domain

---

## Option 4: Oracle Cloud (Best Free Tier)

**Truly free forever VPS:**

1. Go to https://www.oracle.com/cloud/free/
2. Sign up (no credit card for some regions)
3. Create VM (1GB RAM free)
4. Deploy manually (I'll help)

**Benefits:**
- ✅ Free FOREVER
- ✅ Full VPS control
- ✅ No limitations
- ✅ Professional setup

---

## My Recommendation: Cyclic

**Why Cyclic:**
- ✅ No credit card required
- ✅ No sleep/spin down
- ✅ WebSocket support
- ✅ Custom domain free
- ✅ Easiest setup
- ✅ Always on

**Deploy now:**
1. https://www.cyclic.sh
2. Sign in with GitHub
3. Deploy `reydaarsolution-ows/codexmsg`
4. Done in 3 minutes!

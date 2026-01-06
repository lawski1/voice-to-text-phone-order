# Deploy via GitHub - Step by Step Guide

This guide will help you deploy your voice-to-text phone order system using GitHub with various hosting platforms.

## Option 1: Railway (Recommended - Easiest)

Railway automatically deploys from GitHub with zero configuration.

### Steps:

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Go to Railway**:
   - Visit [railway.app](https://railway.app)
   - Sign up/login with GitHub

3. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js

4. **Add Environment Variables**:
   - Click on your service
   - Go to "Variables" tab
   - Add these variables:
     ```
     TWILIO_ACCOUNT_SID=your_account_sid
     TWILIO_AUTH_TOKEN=your_auth_token
     TWILIO_PHONE_NUMBER=+1234567890
     NODE_ENV=production
     PORT=3000
     ```

5. **Deploy**:
   - Railway will automatically deploy
   - Wait for build to complete
   - Copy your app URL (e.g., `https://your-app.railway.app`)

6. **Configure Twilio Webhooks**:
   - Go to [Twilio Console](https://console.twilio.com)
   - Phone Numbers → Your Number
   - Set webhook URL: `https://your-app.railway.app/twilio/voice`
   - Status callback: `https://your-app.railway.app/twilio/status`

**Cost:** $5/month (free trial available)

---

## Option 2: Render (Free Tier Available)

### Steps:

1. **Push to GitHub** (same as above)

2. **Go to Render**:
   - Visit [render.com](https://render.com)
   - Sign up/login with GitHub

3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

4. **Configure Service**:
   - **Name:** voice-to-text-orders
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free (or paid)

5. **Add Environment Variables**:
   - Scroll to "Environment Variables"
   - Add:
     ```
     NODE_ENV=production
     PORT=3000
     TWILIO_ACCOUNT_SID=your_account_sid
     TWILIO_AUTH_TOKEN=your_auth_token
     TWILIO_PHONE_NUMBER=+1234567890
     ```

6. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy your app URL

7. **Configure Twilio Webhooks** (same as Railway)

**Cost:** Free tier available (with limitations), $7/month for better performance

---

## Option 3: Heroku (via GitHub)

### Steps:

1. **Push to GitHub** (same as above)

2. **Install Heroku CLI**:
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Or download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Login to Heroku**:
   ```bash
   heroku login
   ```

4. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

5. **Connect GitHub**:
   - Go to [Heroku Dashboard](https://dashboard.heroku.com)
   - Select your app
   - Go to "Deploy" tab
   - Under "Deployment method", select "GitHub"
   - Connect your repository
   - Enable "Automatic deploys" from main branch

6. **Set Environment Variables**:
   ```bash
   heroku config:set TWILIO_ACCOUNT_SID=your_account_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_auth_token
   heroku config:set TWILIO_PHONE_NUMBER=+1234567890
   heroku config:set NODE_ENV=production
   ```

7. **Deploy**:
   - Click "Deploy Branch" in Heroku dashboard
   - Or push to main: `git push heroku main`

8. **Configure Twilio Webhooks**:
   - Your app URL: `https://your-app-name.herokuapp.com`
   - Set webhook: `https://your-app-name.herokuapp.com/twilio/voice`

**Cost:** Free tier discontinued, $7/month minimum

---

## Option 4: Vercel (Alternative)

### Steps:

1. **Push to GitHub**

2. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub

3. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository

4. **Configure**:
   - Framework Preset: Other
   - Build Command: (leave empty or `npm install`)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

5. **Add Environment Variables**:
   - Add all Twilio variables

6. **Deploy**

**Note:** Vercel is optimized for frontend, but can work for Node.js APIs

---

## Quick Setup Script

If you haven't initialized git yet, run this:

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Voice-to-text phone order system"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## After Deployment

### 1. Test Your Deployment

```bash
# Health check
curl https://your-app-url.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Update Twilio Webhooks

1. Go to [Twilio Console](https://console.twilio.com)
2. Phone Numbers → Your Number
3. Set:
   - **A CALL COMES IN:** `https://your-app-url.com/twilio/voice`
   - **STATUS CALLBACK:** `https://your-app-url.com/twilio/status`

### 3. Test a Phone Call

1. Call your Twilio number
2. Speak an order
3. Check dashboard: `https://your-app-url.com`
4. Verify order appears

---

## Troubleshooting

### Build Fails

- Check that `package.json` has correct scripts
- Verify Node.js version (18+)
- Check build logs in platform dashboard

### App Crashes

- Check environment variables are set correctly
- Review application logs
- Verify database file permissions (SQLite)

### Webhooks Not Working

- Verify your app URL is publicly accessible
- Check Twilio webhook configuration
- Review server logs for errors
- Test webhook URL manually with curl

### Database Issues

- SQLite file is created automatically
- For production, consider PostgreSQL (Railway/Render support this)
- Check file permissions if issues occur

---

## Recommended: Railway

For fastest deployment, I recommend **Railway**:
- ✅ Auto-detects from GitHub
- ✅ Zero configuration needed
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ $5/month (reasonable)

---

## Next Steps

1. Choose a platform (Railway recommended)
2. Push code to GitHub
3. Connect repository to platform
4. Add environment variables
5. Deploy!
6. Update Twilio webhooks
7. Test with phone call

Your app will be live in minutes! 🚀


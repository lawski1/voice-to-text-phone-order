# ⚡ Quick Start - Deploy in 5 Minutes

## 🎯 Fastest Path to Working Deployment

### Step 1: Push to GitHub (if not done)

```bash
# Check if you have a GitHub remote
git remote -v

# If not, create repo on GitHub.com and run:
git remote add origin https://github.com/YOUR_USERNAME/voice-to-text-phone-order.git
git push -u origin main
```

---

### Step 2: Deploy to Render.com

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Click:** "New +" → "Web Service"
4. **Connect** your GitHub repo
5. **Settings:**
   - Name: `voice-orders`
   - Build: `npm install`
   - Start: `npm start`
6. **Click:** "Create Web Service"

---

### Step 3: Add Environment Variables

**In Render → Your Service → Environment:**

Add these 5 variables:

```
TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = your_auth_token
TWILIO_PHONE_NUMBER = +18443513697
NODE_ENV = production
PORT = 10000
```

*(Get SID and Token from Twilio Console → Account)*

---

### Step 4: Get Your URL

**In Render dashboard:**
- Copy your service URL (e.g., `https://voice-orders.onrender.com`)

---

### Step 5: Configure Twilio

1. **Twilio Console:** https://console.twilio.com
2. **Phone Numbers** → **(844) 351-3697**
3. **"A CALL COMES IN"** → Webhook
4. **URL:** `https://YOUR-RENDER-URL.onrender.com/twilio/voice`
5. **Method:** POST
6. **Save**

7. **Verify your number:**
   - Phone Numbers → Verified Caller IDs
   - Add: **+13479074828**
   - Enter verification code

---

### Step 6: Test

1. **Health:** `https://YOUR-URL.onrender.com/health`
2. **Webhook:** `https://YOUR-URL.onrender.com/twilio/voice`
3. **Call:** (844) 351-3697

---

## ✅ Done!

**That's it!** Your app should be working.

**See FRESH_START_DEPLOY.md for detailed instructions.**


# 🚀 DEPLOY NOW - Step by Step

## ✅ Step 1: Code is Ready!

Your code is already on GitHub: `https://github.com/lawski1/voice-to-text-phone-order.git`

---

## 🎯 Step 2: Deploy to Render.com

### A. Sign Up / Login

1. **Go to:** https://render.com
2. **Click:** "Get Started for Free" or "Sign In"
3. **Sign in with GitHub** (recommended - click "Continue with GitHub")
4. **Authorize** Render to access your GitHub account

---

### B. Create Web Service

1. **In Render dashboard:**
   - Click the **"New +"** button (top right)
   - Select **"Web Service"**

2. **Connect Repository:**
   - You'll see "Connect a repository"
   - Click **"Connect GitHub"** (if not already connected)
   - Find and select: **`lawski1/voice-to-text-phone-order`**
   - Click **"Connect"**

3. **Configure Service:**
   - **Name:** `voice-orders` (or any name you like)
   - **Region:** Choose closest to you (e.g., "Oregon (US West)")
   - **Branch:** `main` (should be selected by default)
   - **Root Directory:** Leave empty
   - **Runtime:** `Node` (should auto-detect)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Click:** **"Create Web Service"**

5. **Wait for build** (2-3 minutes)
   - You'll see build logs
   - Wait until it says "Your service is live at..."

---

### C. Add Environment Variables

**While it's building (or after), add these:**

1. **In Render dashboard:**
   - Click on your service name
   - Go to **"Environment"** tab (left sidebar)
   - Click **"Add Environment Variable"**

2. **Add these 5 variables:**

   **Variable 1:**
   ```
   Key: TWILIO_ACCOUNT_SID
   Value: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   *(Get from: Twilio Console → Account → Account SID)*

   **Variable 2:**
   ```
   Key: TWILIO_AUTH_TOKEN
   Value: your_auth_token_here
   ```
   *(Get from: Twilio Console → Account → Auth Token - click to reveal)*

   **Variable 3:**
   ```
   Key: TWILIO_PHONE_NUMBER
   Value: +18443513697
   ```
   *(Your Twilio phone number in E.164 format)*

   **Variable 4:**
   ```
   Key: NODE_ENV
   Value: production
   ```

   **Variable 5:**
   ```
   Key: PORT
   Value: 10000
   ```
   *(Render uses port 10000 by default)*

3. **After adding each variable:**
   - Render will automatically redeploy
   - Wait for deployment to finish (check "Events" tab)

---

### D. Get Your Render URL

1. **In Render dashboard:**
   - Click on your service
   - At the top, you'll see: **"Your service is live at:"**
   - Copy the URL (e.g., `https://voice-orders-xxxx.onrender.com`)

**Save this URL!** You'll need it for Twilio.

---

## 📞 Step 3: Configure Twilio Webhook

1. **Go to Twilio Console:**
   - https://console.twilio.com
   - Sign in

2. **Navigate to Phone Numbers:**
   - Left sidebar → **"Phone Numbers"** → **"Manage"** → **"Active Numbers"**
   - Click on your number: **(844) 351-3697**

3. **Configure Webhook:**
   - Scroll down to **"Voice & Fax"** section
   - Find **"A CALL COMES IN"**
   - Select: **"Webhook"** (not "TwiML Bin")
   - **URL:** `https://YOUR-RENDER-URL.onrender.com/twilio/voice`
     *(Replace YOUR-RENDER-URL with your actual Render URL)*
   - **HTTP Method:** Select **"POST"** (important!)
   - Click **"Save"** (bottom of page)

4. **Verify Your Phone Number (Remove Trial Message):**
   - In Twilio Console → **"Phone Numbers"** → **"Verified Caller IDs"**
   - Click **"Add a new Caller ID"**
   - Enter your phone: **+13479074828**
   - Click **"Verify"**
   - Twilio will call/text you with a code
   - Enter the code to verify
   - **This removes the "trial account" message!**

---

## ✅ Step 4: Test Deployment

### Test 1: Health Check
- Open in browser: `https://YOUR-RENDER-URL.onrender.com/health`
- Should show: `{"status":"ok","timestamp":"..."}`

### Test 2: Webhook Test
- Open in browser: `https://YOUR-RENDER-URL.onrender.com/twilio/voice`
- Should show: XML code with "Park Slope Perk" in it

### Test 3: Dashboard
- Open in browser: `https://YOUR-RENDER-URL.onrender.com`
- Should show: "Park Slope Perk - Order Dashboard"

### Test 4: Make a Phone Call
- Call: **(844) 351-3697**
- You should hear: **"Thank you for calling Park Slope Perk!"**
- Speak your order (e.g., "I'd like two large lattes")
- Press **#** when done
- You should hear: **"Perfect! We got your order..."**

### Test 5: Check Dashboard for Order
- Refresh: `https://YOUR-RENDER-URL.onrender.com`
- Your order should appear in the list!

---

## 🎉 Success!

**If all tests pass, you're done!**

Your voice-to-text phone order system is now:
- ✅ Deployed and live
- ✅ Receiving phone calls
- ✅ Transcribing orders
- ✅ Displaying orders in dashboard

---

## 🐛 Troubleshooting

### Service Won't Start
- Check Render **"Logs"** tab for errors
- Verify all 5 environment variables are set
- Make sure `PORT=10000` is set

### Health Check Fails
- Check Render logs
- Verify service is "Live" (not "Building" or "Failed")

### Webhook Returns 404
- Verify URL is correct: `/twilio/voice`
- Check Render logs for routing errors
- Make sure service is deployed

### Phone Call Doesn't Work
- Check Twilio webhook URL is correct
- Verify HTTP method is **POST** (not GET)
- Check Render logs for incoming requests
- Verify phone number is verified in Twilio

### Still Hearing "Trial Account" Message
- Make sure your phone number is verified in Twilio
- Go to: Phone Numbers → Verified Caller IDs
- Verify **+13479074828** is listed

---

## 📋 Quick Checklist

- [ ] Render.com account created
- [ ] Web service created and connected to GitHub
- [ ] All 5 environment variables added
- [ ] Service deployed and "Live"
- [ ] Render URL copied
- [ ] Twilio webhook configured with Render URL
- [ ] Twilio webhook method set to POST
- [ ] Phone number verified in Twilio
- [ ] Health check works
- [ ] Webhook test works
- [ ] Phone call works
- [ ] Orders appear in dashboard

---

**Ready? Start with Step 2A above!** 🚀


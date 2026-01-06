# Testing Guide

Complete guide for testing the Voice-to-Text Phone Order System.

## Prerequisites

- Node.js installed
- Twilio account with phone number
- ngrok installed (for local webhook testing)

## Step 1: Initial Setup

### Install Dependencies

```bash
npm install
```

### Configure Environment

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your Twilio credentials:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   PORT=3000
   NODE_ENV=development
   ```

### Start the Server

```bash
npm start
```

You should see:
```
Connected to SQLite database
Database tables initialized
Server running on port 3000
Health check: http://localhost:3000/health
```

## Step 2: Expose Local Server (ngrok)

Since Twilio needs to reach your local server, use ngrok:

1. **Install ngrok** (if not already installed):
   - Download from: https://ngrok.com/download
   - Or via Homebrew: `brew install ngrok`

2. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL**:
   - You'll see something like: `https://abc123.ngrok.io`
   - Copy this URL - you'll need it for Twilio webhooks

4. **Keep ngrok running** in a separate terminal window

## Step 3: Configure Twilio Webhooks

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to: **Phone Numbers → Manage → Active Numbers**
3. Click on your phone number
4. Scroll to **Voice & Fax** section
5. Configure:
   - **A CALL COMES IN**:
     - Select: **Webhook**
     - URL: `https://your-ngrok-url.ngrok.io/twilio/voice`
     - HTTP Method: **POST**
   - **STATUS CALLBACK URL**:
     - `https://your-ngrok-url.ngrok.io/twilio/status`
   - **STATUS CALLBACK EVENT**:
     - Check: `initiated`, `ringing`, `answered`, `completed`
6. Click **Save**

## Step 4: Test the Dashboard

1. **Open the dashboard**:
   ```
   http://localhost:3000
   ```

2. **Verify it loads**:
   - You should see the dashboard with stats cards
   - Stats should show zeros initially

3. **Test API endpoints** (using browser console or curl):

   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Get orders (should be empty initially)
   curl http://localhost:3000/api/orders
   
   # Get statistics
   curl http://localhost:3000/api/orders/stats/summary
   ```

## Step 5: Test Phone Call Flow

### Make a Test Call

1. **Call your Twilio phone number** from any phone
2. **Listen for the greeting**: "Welcome to our coffee shop! Please tell us your order after the beep."
3. **Speak your order** clearly (e.g., "I'd like two large lattes and a croissant")
4. **Press # or wait** for the recording to finish (60 seconds max)
5. **Hang up** after hearing "Thank you for your order!"

### What Happens Behind the Scenes

1. Twilio receives the call
2. Twilio sends webhook to `/twilio/voice`
3. Server responds with TwiML to record the call
4. Customer speaks their order
5. Twilio transcribes the audio
6. Twilio sends transcription to `/twilio/transcription`
7. Server parses the order and creates database entry
8. Order appears in dashboard

### Verify the Order

1. **Wait 10-30 seconds** for transcription to complete
2. **Refresh the dashboard** (or wait for auto-refresh)
3. **Check for new order**:
   - Order should appear with status "pending"
   - Phone number should be visible
   - Order text should show the transcription
   - Items should be parsed (if recognized)

## Step 6: Test Order Management

### Update Order Status

1. **Find a pending order** in the dashboard
2. **Click "Confirm"** button
3. **Verify status changes** to "confirmed"
4. **Click "Start Preparing"**
5. **Verify status changes** to "preparing"
6. **Continue through workflow**:
   - "Mark Ready" → status: "ready"
   - "Complete" → status: "completed"

### Test Cancellation

1. **Find a pending order**
2. **Click "Cancel"** button
3. **Verify status changes** to "cancelled"

## Step 7: Test API Endpoints

### Using curl or Postman

```bash
# Get all orders
curl http://localhost:3000/api/orders

# Get orders by status
curl http://localhost:3000/api/orders?status=pending

# Get specific order
curl http://localhost:3000/api/orders/1

# Update order status
curl -X PATCH http://localhost:3000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'

# Get statistics
curl http://localhost:3000/api/orders/stats/summary

# Get call history
curl http://localhost:3000/api/orders/calls/history
```

### Using Browser Console

Open browser console on the dashboard page and run:

```javascript
// Get all orders
fetch('/api/orders').then(r => r.json()).then(console.log);

// Get statistics
fetch('/api/orders/stats/summary').then(r => r.json()).then(console.log);

// Update order status
fetch('/api/orders/1/status', {
  method: 'PATCH',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({status: 'confirmed'})
}).then(r => r.json()).then(console.log);
```

## Step 8: Test Order Parser

The order parser recognizes various coffee shop items. Test with these sample orders:

### Sample Test Orders

1. **Simple order**:
   - Say: "I'd like a medium cappuccino"
   - Expected: 1 medium cappuccino, $3.50

2. **Multiple items**:
   - Say: "Can I get two large vanilla lattes and a muffin?"
   - Expected: 2 large vanilla lattes ($4.25 each), 1 muffin ($2.75)

3. **With quantities**:
   - Say: "I need three small americanos"
   - Expected: 3 small americanos, $3.00 each

4. **Complex order**:
   - Say: "One large mocha, two medium iced coffees, and a croissant"
   - Expected: Multiple items with correct pricing

5. **Unrecognized items**:
   - Say: "I want a blueberry scone"
   - Expected: Order created but marked as "needs review"

## Step 9: Monitor Logs

### Server Logs

Watch the server console for:
- Database connections
- Incoming webhooks
- Order creation
- Errors

### Twilio Console

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Monitor → Logs → Calls**
3. View call details:
   - Call status
   - Recording URL
   - Transcription status
   - Webhook requests/responses

### Check Database

The database file is at: `database/orders.db`

You can inspect it using:
```bash
sqlite3 database/orders.db

# Then run SQL queries:
.tables
SELECT * FROM orders;
SELECT * FROM order_items;
SELECT * FROM phone_calls;
.quit
```

## Step 10: Test Error Scenarios

### Test Invalid Webhook

```bash
curl -X POST http://localhost:3000/twilio/transcription \
  -d "CallSid=test123&TranscriptionStatus=completed&TranscriptionText=test order"
```

### Test Missing Environment Variables

Temporarily remove `.env` and restart server - should show helpful error messages.

### Test Database Errors

Stop the server, delete `database/orders.db`, restart - should recreate database.

## Troubleshooting

### Orders Not Appearing

1. **Check server logs** for errors
2. **Verify transcription completed**:
   - Check Twilio console → Logs → Calls
   - Look for transcription status
3. **Check webhook delivery**:
   - Twilio console shows webhook requests
   - Verify status code is 200
4. **Check database**:
   ```bash
   sqlite3 database/orders.db "SELECT * FROM orders;"
   ```

### Webhook Not Receiving Calls

1. **Verify ngrok is running** and URL is correct
2. **Check Twilio webhook configuration** matches ngrok URL
3. **Test webhook manually**:
   ```bash
   curl -X POST https://your-ngrok-url.ngrok.io/twilio/voice
   ```
4. **Check ngrok web interface**: `http://localhost:4040` shows all requests

### Transcription Not Working

1. **Check Twilio account balance** (transcription uses credits)
2. **Verify phone number has transcription capability**
3. **Check Twilio console logs** for transcription errors
4. **Ensure recording completed** (wait for full 60 seconds or press #)

### Dashboard Not Loading

1. **Check server is running** on port 3000
2. **Verify static files** are being served:
   ```bash
   curl http://localhost:3000/
   ```
3. **Check browser console** for JavaScript errors
4. **Verify API endpoints** are accessible

## Automated Testing Script

Run the test script (see `test-system.js`):

```bash
node test-system.js
```

This will test:
- Server health
- API endpoints
- Database connectivity
- Order creation
- Status updates

## Next Steps

Once testing is complete:
1. Review all test results
2. Fix any issues found
3. Deploy to production (see `DEPLOYMENT.md`)
4. Set up monitoring and alerts


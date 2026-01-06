# Quick Start Guide

Get your voice-to-text phone order system running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Twilio Account

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio) (free trial available)
2. Get your Account SID and Auth Token from the dashboard
3. Purchase or use a trial phone number

## Step 3: Configure Environment

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Edit `.env` and add your Twilio credentials:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
PORT=3000
NODE_ENV=development
```

## Step 4: Start the Server

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

## Step 5: Expose Your Local Server (for Testing)

Twilio needs to reach your local server. Use ngrok:

1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

## Step 6: Configure Twilio Webhooks

1. Go to [Twilio Console](https://console.twilio.com) → Phone Numbers
2. Click on your phone number
3. Under "Voice & Fax", set:
   - **A CALL COMES IN**: 
     - Webhook
     - URL: `https://your-ngrok-url.ngrok.io/twilio/voice`
     - Method: POST
   - **STATUS CALLBACK URL**: 
     - `https://your-ngrok-url.ngrok.io/twilio/status`

4. Save

## Step 7: Test It!

1. Open your browser: `http://localhost:3000`
2. You should see the dashboard (empty at first)
3. Call your Twilio phone number
4. When prompted, say: "Hi, I'd like two large lattes and a croissant"
5. Hang up
6. Wait a few seconds for transcription
7. Refresh the dashboard - your order should appear!

## Testing Tips

### Sample Orders to Try:

- "I'd like a medium cappuccino"
- "Can I get two large vanilla lattes and a muffin?"
- "I need three small americanos"
- "One large mocha and a bagel please"

### Check Order Details:

- Click on an order card to see full details
- Update order status using the action buttons
- View statistics in the top cards

## Troubleshooting

### "Cannot connect to database"
- Make sure you ran `npm install`
- Check file permissions in the `database/` folder

### "Twilio webhook error"
- Verify ngrok is running and URL is correct
- Check that webhook URL in Twilio matches your ngrok URL
- Make sure server is running on port 3000

### "No orders appearing"
- Check server console for errors
- Verify transcription completed (check Twilio console)
- Check that `.env` file has correct Twilio credentials

### "Transcription not working"
- Verify your Twilio account has transcription enabled
- Check Twilio account balance (transcription uses credits)
- Review Twilio console logs for transcription status

## Next Steps

- Customize menu items in `services/orderParser.js`
- Modify dashboard styling in `public/index.html`
- Deploy to production (see `DEPLOYMENT.md`)
- Add more features (SMS notifications, customer database, etc.)

## Need Help?

- Check the main `README.md` for detailed documentation
- Review `DEPLOYMENT.md` for production setup
- Check Twilio documentation: https://www.twilio.com/docs


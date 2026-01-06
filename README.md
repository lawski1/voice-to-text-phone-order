# Voice-to-Text Phone Order System for Coffee Shops

A complete MVP solution for processing phone orders using voice-to-text technology. Customers can call a phone number, speak their order, and the system automatically transcribes and creates an order in the dashboard.

## Features

- 📞 **Phone Integration**: Twilio-powered phone system for receiving orders
- 🎤 **Voice-to-Text**: Automatic transcription of customer orders
- 📋 **Order Management**: Complete order lifecycle (pending → confirmed → preparing → ready → completed)
- 📊 **Dashboard**: Real-time web dashboard for viewing and managing orders
- 💾 **Database**: SQLite database for storing orders and call history
- 🚀 **Deployment Ready**: Docker configuration for easy deployment

## Prerequisites

- Node.js 18+ installed
- Twilio account with:
  - Account SID
  - Auth Token
  - Phone number (capable of receiving calls)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your Twilio credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your Twilio credentials:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Initialize Database

The database will be created automatically on first run, but you can also run:

```bash
npm run setup-db
```

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### 5. Configure Twilio Webhooks

1. Log into your Twilio Console
2. Go to Phone Numbers → Manage → Active Numbers
3. Click on your phone number
4. Under "Voice & Fax", set:
   - **A CALL COMES IN**: Webhook → `https://your-domain.com/twilio/voice`
   - **STATUS CALLBACK URL**: `https://your-domain.com/twilio/status`

### 6. Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

## Deployment

### Using Docker

1. Build and run with Docker Compose:

```bash
docker-compose up -d
```

2. Make sure your `.env` file is configured with production values

3. Update Twilio webhooks to point to your deployed URL

### Manual Deployment

1. Set up a Node.js server (Heroku, DigitalOcean, AWS, etc.)
2. Install dependencies: `npm install --production`
3. Set environment variables
4. Start the server: `npm start`
5. Use a process manager like PM2 for production:
   ```bash
   npm install -g pm2
   pm2 start server.js
   ```

### Environment Variables for Production

Make sure to set these in your production environment:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `PORT` (defaults to 3000)
- `NODE_ENV=production`

## API Endpoints

### Orders

- `GET /api/orders` - Get all orders (supports `?status=pending` and `?limit=50`)
- `GET /api/orders/:id` - Get a specific order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/summary` - Get order statistics
- `GET /api/orders/calls/history` - Get call history

### Twilio Webhooks

- `POST /twilio/voice` - Handle incoming calls
- `POST /twilio/transcription` - Process transcriptions
- `POST /twilio/recording` - Handle recording status
- `POST /twilio/status` - Handle call status updates

### Health Check

- `GET /health` - Server health check

## Order Status Flow

1. **pending** - New order received, awaiting confirmation
2. **confirmed** - Order confirmed by staff
3. **preparing** - Order is being prepared
4. **ready** - Order is ready for pickup
5. **completed** - Order has been completed
6. **cancelled** - Order was cancelled

## How It Works

1. Customer calls the Twilio phone number
2. System greets the customer and asks them to speak their order
3. Customer speaks their order (up to 60 seconds)
4. Twilio transcribes the audio to text
5. System parses the order text to extract items and quantities
6. Order is created in the database with status "pending"
7. Staff can view and manage orders in the web dashboard
8. Staff updates order status as it progresses through fulfillment

## Order Parser

The system includes a basic order parser that recognizes common coffee shop items:

- Coffee drinks: espresso, americano, cappuccino, latte, mocha, etc.
- Sizes: small, medium, large, extra large
- Variations: vanilla, caramel, hazelnut, etc.
- Food items: croissant, muffin, bagel, sandwich

The parser can be enhanced with more sophisticated NLP/AI for better accuracy.

## Database Schema

### orders
- id (INTEGER PRIMARY KEY)
- phone_number (TEXT)
- customer_name (TEXT)
- order_text (TEXT)
- status (TEXT)
- total_amount (REAL)
- created_at (DATETIME)
- updated_at (DATETIME)

### order_items
- id (INTEGER PRIMARY KEY)
- order_id (INTEGER)
- item_name (TEXT)
- quantity (INTEGER)
- price (REAL)

### phone_calls
- id (INTEGER PRIMARY KEY)
- call_sid (TEXT UNIQUE)
- from_number (TEXT)
- to_number (TEXT)
- status (TEXT)
- transcription (TEXT)
- created_at (DATETIME)

## Customization

### Adding Menu Items

Edit `services/orderParser.js` to add more items to the `coffeeMenu` object.

### Styling

The dashboard styles are in `public/index.html`. Modify the `<style>` section to customize the appearance.

### Order Processing Logic

Modify `services/orderParser.js` to improve order parsing accuracy or add custom business logic.

## Troubleshooting

### Twilio Webhook Not Working

- Ensure your server is publicly accessible (use ngrok for local testing)
- Check that webhook URLs are correctly configured in Twilio
- Verify your Twilio credentials in `.env`

### Orders Not Appearing

- Check server logs for errors
- Verify database file permissions
- Ensure transcription is completing successfully

### Transcription Issues

- Check Twilio account has transcription enabled
- Verify phone number has proper capabilities
- Check Twilio logs in the console

## Local Testing with ngrok

For local development, use ngrok to expose your local server:

```bash
ngrok http 3000
```

Then use the ngrok URL in your Twilio webhook configuration.

## License

MIT

## Support

For issues or questions, please check:
- Twilio documentation: https://www.twilio.com/docs
- Node.js documentation: https://nodejs.org/docs


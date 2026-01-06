# Deployment Guide

This guide will help you deploy the Voice-to-Text Phone Order System to production.

## Prerequisites

- Node.js 18+ or Docker
- Twilio account with phone number
- Publicly accessible server (for Twilio webhooks)

## Option 1: Docker Deployment (Recommended)

### Step 1: Prepare Environment

1. Copy the environment example file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your production values:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   PORT=3000
   NODE_ENV=production
   ```

### Step 2: Build and Run

```bash
docker-compose up -d
```

### Step 3: Verify

Check that the container is running:
```bash
docker-compose ps
```

Check logs:
```bash
docker-compose logs -f
```

## Option 2: Manual Deployment

### Step 1: Server Setup

1. SSH into your server
2. Install Node.js 18+:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Clone or upload your project files

### Step 2: Install Dependencies

```bash
npm install --production
```

### Step 3: Configure Environment

Create `.env` file with your credentials (see Option 1, Step 1)

### Step 4: Use Process Manager (PM2)

```bash
npm install -g pm2
pm2 start server.js --name voice-order-system
pm2 save
pm2 startup
```

### Step 5: Set Up Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/voice-orders`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/voice-orders /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Option 3: Platform-as-a-Service

### Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set TWILIO_ACCOUNT_SID=your_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_token
   heroku config:set TWILIO_PHONE_NUMBER=+1234567890
   ```
5. Deploy: `git push heroku main`

### Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Render

1. Create new Web Service
2. Connect your repository
3. Set environment variables
4. Deploy

## Configure Twilio Webhooks

After deployment, configure your Twilio phone number:

1. Log into [Twilio Console](https://console.twilio.com)
2. Go to Phone Numbers → Manage → Active Numbers
3. Click on your phone number
4. Under "Voice & Fax", configure:
   - **A CALL COMES IN**: 
     - Webhook
     - URL: `https://your-domain.com/twilio/voice`
     - HTTP: POST
   - **STATUS CALLBACK URL**: 
     - `https://your-domain.com/twilio/status`
   - **STATUS CALLBACK EVENT**: 
     - Check: `initiated`, `ringing`, `answered`, `completed`

5. Save the configuration

## Testing the Deployment

### 1. Health Check

```bash
curl https://your-domain.com/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### 2. Test Phone Call

1. Call your Twilio phone number
2. Speak an order (e.g., "I'd like two large lattes and a croissant")
3. Check the dashboard at `https://your-domain.com`
4. Verify the order appears

### 3. Check Logs

```bash
# Docker
docker-compose logs -f

# PM2
pm2 logs voice-order-system

# Heroku
heroku logs --tail
```

## Monitoring

### Health Monitoring

Set up uptime monitoring (UptimeRobot, Pingdom, etc.) to check:
- `https://your-domain.com/health`

### Database Backup

The SQLite database is stored in `database/orders.db`. Set up regular backups:

```bash
# Backup script
#!/bin/bash
cp database/orders.db backups/orders-$(date +%Y%m%d-%H%M%S).db
```

### Log Monitoring

Monitor application logs for:
- Failed transcriptions
- Database errors
- Twilio webhook errors

## Scaling Considerations

For higher volume:

1. **Database**: Migrate from SQLite to PostgreSQL or MySQL
2. **Caching**: Add Redis for frequently accessed data
3. **Load Balancing**: Use multiple instances behind a load balancer
4. **Queue System**: Use a message queue (RabbitMQ, AWS SQS) for order processing

## Security Checklist

- [ ] Environment variables are set securely (not in code)
- [ ] HTTPS is enabled (SSL certificate)
- [ ] Rate limiting is configured
- [ ] Database file has proper permissions
- [ ] Twilio webhook validation is enabled (recommended)
- [ ] CORS is configured appropriately
- [ ] Regular security updates are applied

## Troubleshooting

### Webhooks Not Working

- Verify your server is publicly accessible
- Check firewall rules allow incoming connections
- Test webhook URL manually with curl
- Check Twilio webhook logs in console

### Orders Not Appearing

- Check server logs for errors
- Verify database file permissions
- Check Twilio transcription status
- Verify order parser is working correctly

### High Latency

- Check server resources (CPU, memory)
- Consider database optimization
- Review network latency
- Check Twilio API response times

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test Twilio webhook connectivity
4. Review Twilio console for call logs


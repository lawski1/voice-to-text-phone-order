const express = require('express');
const twilio = require('twilio');
const db = require('../database/db');
const { parseOrder } = require('../services/orderParser');

const router = express.Router();

// Twilio webhook authentication
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Handle incoming phone call - support both GET and POST
const handleVoiceWebhook = (req, res) => {
  console.log('[twilio/voice] webhook called', {
    method: req.method,
    url: req.url,
    path: req.path,
    body: req.body,
    query: req.query
  });
  
  try {
    const twiml = new twilio.twiml.VoiceResponse();

    // Helpful debug logging (view in Railway logs)
    const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').toString().split(',')[0].trim();
    const host = (req.headers['x-forwarded-host'] || req.get('host') || '').toString().split(',')[0].trim();
    const baseUrl = host ? `${proto}://${host}` : '';
    
    const callData = {
      CallSid: req.body?.CallSid || req.query?.CallSid,
      From: req.body?.From || req.query?.From,
      To: req.body?.To || req.query?.To,
      baseUrl
    };
    
    console.log('[twilio/voice] incoming call', callData);
    
    // Park Slope Perk greeting message
    twiml.say(
      { voice: 'alice', language: 'en-US' },
      'Thank you for calling Park Slope Perk! We\'re ready to take your order. ' +
      'Please tell us what you\'d like, including the drink size and any modifications. ' +
      'Speak clearly after the beep, and press pound when you\'re finished. Thank you!'
    );
    
    // Record the order with transcription
    const recordOptions = {
      maxLength: 60,
      transcribe: true,
      finishOnKey: '#'
    };
    
    // Use absolute URLs if we have baseUrl, otherwise use relative
    if (baseUrl) {
      recordOptions.transcribeCallback = `${baseUrl}/twilio/transcription`;
      recordOptions.recordingStatusCallback = `${baseUrl}/twilio/recording`;
    } else {
      recordOptions.transcribeCallback = '/twilio/transcription';
      recordOptions.recordingStatusCallback = '/twilio/recording';
    }
    
    twiml.record(recordOptions);
    
    // Park Slope Perk closing message
    twiml.say(
      { voice: 'alice', language: 'en-US' },
      'Perfect! We got your order and will have it ready for you soon. ' +
      'Thank you for calling Park Slope Perk. Have a wonderful day!'
    );
    
    twiml.hangup();
    
    // Send TwiML response
    res.type('text/xml');
    const twimlString = twiml.toString();
    console.log('[twilio/voice] sending TwiML response');
    res.send(twimlString);
  } catch (error) {
    console.error('[twilio/voice] ERROR:', error);
    // Send error response to Twilio
    const errorTwiml = new twilio.twiml.VoiceResponse();
    errorTwiml.say(
      { voice: 'alice', language: 'en-US' },
      'We\'re sorry, there was an error processing your call. Please try again later.'
    );
    errorTwiml.hangup();
    res.type('text/xml');
    res.status(200).send(errorTwiml.toString());
  }
};

// Handle both GET and POST (Twilio may use either)
router.get('/voice', handleVoiceWebhook);
router.post('/voice', handleVoiceWebhook);

// Export handler for testing
module.exports.handleVoiceWebhook = handleVoiceWebhook;

// Handle transcription callback
router.post('/transcription', async (req, res) => {
  const {
    CallSid,
    From,
    To,
    TranscriptionText,
    TranscriptionStatus
  } = req.body;
  
  try {
    console.log('[twilio/transcription] received', {
      CallSid,
      From,
      To,
      TranscriptionStatus,
      hasText: Boolean(TranscriptionText && String(TranscriptionText).trim())
    });

    const dbInstance = db.getDb();
    
    // Save call record
    dbInstance.run(
      `INSERT INTO phone_calls (call_sid, from_number, to_number, status, transcription)
       VALUES (?, ?, ?, ?, ?)`,
      [CallSid, From, To, TranscriptionStatus, TranscriptionText],
      function(err) {
        if (err) {
          console.error('Error saving call record:', err);
        }
      }
    );
    
    // If transcription is successful, create order
    if (TranscriptionStatus === 'completed' && TranscriptionText) {
      const orderData = parseOrder(TranscriptionText);
      
      // Create order
      dbInstance.run(
        `INSERT INTO orders (phone_number, customer_name, order_text, status, total_amount)
         VALUES (?, ?, ?, 'pending', ?)`,
        [From, orderData.customerName || null, TranscriptionText, orderData.total || 0],
        function(err) {
          if (err) {
            console.error('Error creating order:', err);
            return;
          }
          
          const orderId = this.lastID;
          
          // Add order items
          if (orderData.items && orderData.items.length > 0) {
            orderData.items.forEach(item => {
              dbInstance.run(
                `INSERT INTO order_items (order_id, item_name, quantity, price)
                 VALUES (?, ?, ?, ?)`,
                [orderId, item.name, item.quantity, item.price || 0]
              );
            });
          }
          
          console.log(`Order created: ID ${orderId} from ${From}`);
        }
      );
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing transcription:', error);
    res.status(500).send('Error');
  }
});

// Handle recording status callback
router.post('/recording', (req, res) => {
  console.log('Recording status:', req.body);
  res.status(200).send('OK');
});

// Status callback for calls
router.post('/status', (req, res) => {
  console.log('Call status:', req.body);
  res.status(200).send('OK');
});

module.exports = router;



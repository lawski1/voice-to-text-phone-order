const express = require('express');
const twilio = require('twilio');
const db = require('../database/db');
const { parseOrder } = require('../services/orderParser');

const router = express.Router();

// Twilio webhook authentication
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Handle incoming phone call
router.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Park Slope Perk greeting message
  twiml.say(
    { voice: 'alice', language: 'en-US' },
    'Thank you for calling Park Slope Perk! We\'re ready to take your order. ' +
    'Please tell us what you\'d like, including the drink size and any modifications. ' +
    'Speak clearly after the beep, and press pound when you\'re finished. Thank you!'
  );
  
  // Record the order with transcription
  twiml.record({
    maxLength: 60,
    transcribe: true,
    transcribeCallback: '/twilio/transcription',
    recordingStatusCallback: '/twilio/recording',
    finishOnKey: '#'
  });
  
  // Park Slope Perk closing message
  twiml.say(
    { voice: 'alice', language: 'en-US' },
    'Perfect! We got your order and will have it ready for you soon. ' +
    'Thank you for calling Park Slope Perk. Have a wonderful day!'
  );
  
  twiml.hangup();
  
  res.type('text/xml');
  res.send(twiml.toString());
});

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



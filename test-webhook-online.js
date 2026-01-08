#!/usr/bin/env node

/**
 * Test webhook endpoints on deployed Railway instance
 * Run: node test-webhook-online.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'https://voice-orders-production.up.railway.app';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Webhook-Test-Script'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body,
          isXML: res.headers['content-type']?.includes('xml') || body.trim().startsWith('<?xml')
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoint(name, path, method = 'GET', expectedStatus = 200) {
  try {
    log(`\n${'='.repeat(60)}`, 'blue');
    log(`Testing: ${name}`, 'blue');
    log(`URL: ${BASE_URL}${path}`, 'blue');
    log(`Method: ${method}`, 'blue');
    
    const startTime = Date.now();
    const response = await makeRequest(`${BASE_URL}${path}`, method);
    const duration = Date.now() - startTime;
    
    log(`\nStatus: ${response.status}`, response.status === expectedStatus ? 'green' : 'red');
    log(`Response Time: ${duration}ms`, 'yellow');
    log(`Content-Type: ${response.headers['content-type'] || 'N/A'}`, 'yellow');
    
    if (response.isXML) {
      log(`\n✅ Response is XML (TwiML)`, 'green');
      // Show first 200 chars of XML
      const preview = response.body.substring(0, 200);
      log(`Preview:\n${preview}${response.body.length > 200 ? '...' : ''}`, 'yellow');
      
      // Check for key phrases
      if (response.body.includes('Park Slope Perk')) {
        log(`✅ Contains "Park Slope Perk" greeting`, 'green');
      } else {
        log(`⚠️  Does not contain "Park Slope Perk"`, 'yellow');
      }
      
      if (response.body.includes('<Say')) {
        log(`✅ Contains <Say> element (TwiML)`, 'green');
      }
      
      if (response.body.includes('<Record')) {
        log(`✅ Contains <Record> element`, 'green');
      }
    } else if (response.headers['content-type']?.includes('json')) {
      log(`\n✅ Response is JSON`, 'green');
      try {
        const json = JSON.parse(response.body);
        log(`JSON: ${JSON.stringify(json, null, 2)}`, 'yellow');
      } catch (e) {
        log(`Response: ${response.body.substring(0, 200)}`, 'yellow');
      }
    } else {
      log(`\nResponse: ${response.body.substring(0, 200)}${response.body.length > 200 ? '...' : ''}`, 'yellow');
    }
    
    if (response.status === expectedStatus) {
      log(`\n✅ ${name} - PASSED`, 'green');
      return true;
    } else {
      log(`\n❌ ${name} - FAILED (Expected ${expectedStatus}, got ${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    log(`\n❌ ${name} - ERROR: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🧪 Testing Railway Webhook Endpoints', 'blue');
  log('='.repeat(60), 'blue');
  
  const results = [];
  
  // Test 1: Health endpoint
  results.push(await testEndpoint('Health Check', '/health', 'GET', 200));
  
  // Test 2: Test routes endpoint
  results.push(await testEndpoint('Test Routes', '/test-routes', 'GET', 200));
  
  // Test 3: Twilio webhook (GET)
  results.push(await testEndpoint('Twilio Webhook (GET)', '/twilio/voice', 'GET', 200));
  
  // Test 4: Twilio webhook (POST) - simulate Twilio call
  const twilioPostData = {
    CallSid: 'CA1234567890abcdef1234567890abcdef',
    From: '+13479074828',
    To: '+18443513697',
    CallStatus: 'ringing'
  };
  results.push(await testEndpoint('Twilio Webhook (POST)', '/twilio/voice', 'POST', 200));
  
  // Test 5: Test endpoint
  results.push(await testEndpoint('Test Endpoint', '/twilio-voice-test', 'GET', 200));
  
  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 Test Summary', 'blue');
  log('='.repeat(60), 'blue');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  log(`\nPassed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n✅ All tests passed! Webhook is working correctly.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Verify Twilio webhook is configured:', 'yellow');
    log('   Twilio Console → Phone Numbers → (844) 351-3697', 'yellow');
    log('   "A CALL COMES IN" = Webhook', 'yellow');
    log('   URL: https://voice-orders-production.up.railway.app/twilio/voice', 'yellow');
    log('   Method: POST', 'yellow');
    log('2. Make a test call to (844) 351-3697', 'yellow');
    log('3. Check Railway logs for incoming call', 'yellow');
  } else {
    log('\n⚠️  Some tests failed. Check the errors above.', 'yellow');
    log('\nTroubleshooting:', 'blue');
    log('1. Check Railway deployment status', 'yellow');
    log('2. Check Railway logs for errors', 'yellow');
    log('3. Verify routes are registered', 'yellow');
  }
  
  log('\n' + '='.repeat(60) + '\n', 'blue');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});



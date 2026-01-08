#!/usr/bin/env node

/**
 * Verify Render.com deployment
 * Usage: node verify-deployment.js YOUR-RENDER-URL.onrender.com
 */

const https = require('https');

const RENDER_URL = process.argv[2] || process.env.RENDER_URL;

if (!RENDER_URL) {
  console.error('❌ Please provide Render URL:');
  console.error('   node verify-deployment.js YOUR-URL.onrender.com');
  console.error('   OR set RENDER_URL environment variable');
  process.exit(1);
}

const BASE_URL = RENDER_URL.startsWith('http') ? RENDER_URL : `https://${RENDER_URL}`;

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

function testEndpoint(name, path, expectedStatus = 200) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: { 'User-Agent': 'Deployment-Verifier' }
    };

    const startTime = Date.now();
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const passed = res.statusCode === expectedStatus;
        
        if (passed) {
          log(`✅ ${name} - PASSED (${res.statusCode}, ${duration}ms)`, 'green');
        } else {
          log(`❌ ${name} - FAILED (Expected ${expectedStatus}, got ${res.statusCode})`, 'red');
        }
        
        resolve(passed);
      });
    });

    req.on('error', (error) => {
      log(`❌ ${name} - ERROR: ${error.message}`, 'red');
      resolve(false);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      log(`❌ ${name} - TIMEOUT`, 'red');
      resolve(false);
    });

    req.end();
  });
}

async function runTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🧪 Verifying Render.com Deployment', 'blue');
  log('='.repeat(60), 'blue');
  log(`\nTesting: ${BASE_URL}\n`, 'yellow');

  const results = [];

  results.push(await testEndpoint('Health Check', '/health', 200));
  results.push(await testEndpoint('Dashboard', '/', 200));
  results.push(await testEndpoint('Twilio Webhook', '/twilio/voice', 200));
  results.push(await testEndpoint('Test Routes', '/test-routes', 200));

  const passed = results.filter(r => r).length;
  const total = results.length;

  log('\n' + '='.repeat(60), 'blue');
  log('📊 Test Summary', 'blue');
  log('='.repeat(60), 'blue');
  log(`\nPassed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n✅ All tests passed! Deployment is working correctly.', 'green');
    log('\n📞 Next steps:', 'blue');
    log('1. Configure Twilio webhook:', 'yellow');
    log(`   URL: ${BASE_URL}/twilio/voice`, 'yellow');
    log('   Method: POST', 'yellow');
    log('2. Verify your phone number in Twilio Console', 'yellow');
    log('3. Make a test call to (844) 351-3697', 'yellow');
  } else {
    log('\n⚠️  Some tests failed. Check Render logs.', 'yellow');
  }

  log('\n' + '='.repeat(60) + '\n', 'blue');
  process.exit(passed === total ? 0 : 1);
}

runTests();


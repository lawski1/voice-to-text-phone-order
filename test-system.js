#!/usr/bin/env node

/**
 * Automated testing script for Voice-to-Text Phone Order System
 * Run with: node test-system.js
 */

const http = require('http');
const db = require('./database/db');

const API_BASE = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testsPassed = 0;
let testsFailed = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null, expectJson = true) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (expectJson) {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        } else {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function test(name, testFn) {
  try {
    log(`\n🧪 Testing: ${name}`, 'blue');
    await testFn();
    testsPassed++;
    log(`✅ PASS: ${name}`, 'green');
  } catch (error) {
    testsFailed++;
    log(`❌ FAIL: ${name}`, 'red');
    log(`   Error: ${error.message}`, 'red');
  }
}

async function runTests() {
  log('\n🚀 Starting System Tests\n', 'yellow');
  log('='.repeat(50), 'yellow');

  // Test 1: Server Health
  await test('Server Health Check', async () => {
    const response = await makeRequest('GET', '/health');
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.status || response.data.status !== 'ok') {
      throw new Error('Health check did not return ok status');
    }
  });

  // Test 2: Database Connection
  await test('Database Connection', async () => {
    try {
      await db.init();
      const dbInstance = db.getDb();
      if (!dbInstance) {
        throw new Error('Database instance is null');
      }
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  });

  // Test 3: Get Orders (Empty Initially)
  await test('Get Orders Endpoint', async () => {
    const response = await makeRequest('GET', '/api/orders');
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!Array.isArray(response.data)) {
      throw new Error('Response is not an array');
    }
  });

  // Test 4: Get Statistics
  await test('Get Statistics Endpoint', async () => {
    const response = await makeRequest('GET', '/api/orders/stats/summary');
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (typeof response.data.totalOrders === 'undefined') {
      throw new Error('Statistics missing totalOrders');
    }
  });

  // Test 5: Get Call History
  await test('Get Call History Endpoint', async () => {
    const response = await makeRequest('GET', '/api/orders/calls/history');
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!Array.isArray(response.data)) {
      throw new Error('Response is not an array');
    }
  });

  // Test 6: Create Test Order via Database
  await test('Create Test Order', async () => {
    const dbInstance = db.getDb();
    return new Promise((resolve, reject) => {
      dbInstance.run(
        `INSERT INTO orders (phone_number, customer_name, order_text, status, total_amount)
         VALUES (?, ?, ?, 'pending', ?)`,
        ['+15551234567', 'Test Customer', 'Test order: 2 large lattes', 7.50],
        function(err) {
          if (err) {
            reject(new Error(`Failed to create order: ${err.message}`));
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  });

  // Test 7: Get Specific Order
  await test('Get Specific Order', async () => {
    const response = await makeRequest('GET', '/api/orders/1');
    if (response.status !== 200 && response.status !== 404) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  });

  // Test 8: Update Order Status
  await test('Update Order Status', async () => {
    const response = await makeRequest('PATCH', '/api/orders/1/status', {
      status: 'confirmed'
    });
    if (response.status !== 200 && response.status !== 404) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  });

  // Test 9: Invalid Status Update
  await test('Invalid Status Update (should fail)', async () => {
    const response = await makeRequest('PATCH', '/api/orders/1/status', {
      status: 'invalid_status'
    });
    if (response.status !== 400) {
      throw new Error(`Expected status 400 for invalid status, got ${response.status}`);
    }
  });

  // Test 10: Order Parser
  await test('Order Parser Functionality', async () => {
    const { parseOrder } = require('./services/orderParser');
    
    const testCases = [
      {
        input: "I'd like two large lattes",
        expectedItems: 1,
        expectedTotal: (3.75 + 1.00) * 2 // large latte * 2
      },
      {
        input: "One medium cappuccino",
        expectedItems: 1,
        expectedTotal: 3.50 + 0.50 // medium cappuccino
      }
    ];

    for (const testCase of testCases) {
      const result = parseOrder(testCase.input);
      if (result.items.length === 0) {
        throw new Error(`Parser failed to extract items from: "${testCase.input}"`);
      }
    }
  });

  // Test 11: Static File Serving
  await test('Static File Serving (Dashboard)', async () => {
    const response = await makeRequest('GET', '/', null, false);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.includes('Coffee Shop Order Dashboard')) {
      throw new Error('Dashboard HTML not found');
    }
  });

  // Summary
  log('\n' + '='.repeat(50), 'yellow');
  log('\n📊 Test Summary', 'yellow');
  log(`✅ Passed: ${testsPassed}`, 'green');
  log(`❌ Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`📈 Total: ${testsPassed + testsFailed}`, 'blue');

  if (testsFailed === 0) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
    process.exit(1);
  }
}

// Check if server is running
makeRequest('GET', '/health')
  .then(() => {
    log('✓ Server is running', 'green');
    runTests();
  })
  .catch((error) => {
    log('✗ Server is not running!', 'red');
    log('  Please start the server with: npm start', 'yellow');
    log(`  Error: ${error.message}`, 'red');
    process.exit(1);
  });


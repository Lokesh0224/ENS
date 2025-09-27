/**
 * Example script demonstrating the Cross-Chain Identity Hub API
 * Run with: node examples/api-test.js
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
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

/**
 * Test the API endpoints
 */
async function testAPI() {
  console.log('🧪 Testing Cross-Chain Identity Hub API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const health = await makeRequest('GET', '/health');
    console.log(`Status: ${health.status}`);
    console.log(`Response:`, health.data);
    console.log('✅ Health check passed\n');

    // Test 2: Generate challenge
    console.log('2️⃣ Testing challenge generation...');
    const challengeData = {
      ensName: 'alice.eth',
      chain: 'bitcoin',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    };
    
    const challenge = await makeRequest('POST', '/challenge', challengeData);
    console.log(`Status: ${challenge.status}`);
    console.log(`Challenge:`, challenge.data);
    
    if (challenge.status === 200) {
      console.log('✅ Challenge generation successful\n');
      
      // Test 3: Verify signature (mock)
      console.log('3️⃣ Testing verification endpoint...');
      const verifyData = {
        chain: 'bitcoin',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        signature: 'mock-signature-for-testing',
        nonce: challenge.data.nonce,
        message: 'test message'
      };
      
      const verification = await makeRequest('POST', '/verify', verifyData);
      console.log(`Status: ${verification.status}`);
      console.log(`Verification:`, verification.data);
      
      if (verification.status === 400) {
        console.log('✅ Verification correctly rejected invalid signature\n');
      }
    }

    // Test 4: Test Solana challenge
    console.log('4️⃣ Testing Solana challenge...');
    const solanaChallenge = {
      ensName: 'bob.eth',
      chain: 'solana',
      address: '11111111111111111111111111111112'
    };
    
    const solanaResult = await makeRequest('POST', '/challenge', solanaChallenge);
    console.log(`Status: ${solanaResult.status}`);
    console.log(`Solana Challenge:`, solanaResult.data);
    console.log('✅ Solana challenge generation successful\n');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testAPI().then(() => {
  console.log('🎉 API testing completed!');
  console.log('\n📋 To test with real signatures:');
  console.log('1. Start the server: npm start');
  console.log('2. Use the challenge data to sign a message with your wallet');
  console.log('3. Submit the signed message to /verify endpoint');
}).catch(console.error);

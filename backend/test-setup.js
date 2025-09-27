/**
 * Test script to verify backend setup
 * Run with: node test-setup.js
 */

const express = require('express');
const bitcoinVerify = require('./utils/bitcoinVerify');
const solanaVerify = require('./utils/solanaVerify');
const ipfsService = require('./services/ipfs');
const { computeProofHash } = require('./utils/hash');

console.log('🧪 Testing Cross-Chain Identity Hub Backend Setup...\n');

// Test 1: Dependencies
console.log('1️⃣ Testing dependencies...');
try {
  require('bitcoinjs-lib');
  require('bitcoinjs-message');
  require('tweetnacl');
  require('ipfs-http-client');
  require('keccak');
  require('uuid');
  console.log('✅ All dependencies loaded successfully');
} catch (error) {
  console.log('❌ Dependency error:', error.message);
}

// Test 2: Bitcoin verification utility
console.log('\n2️⃣ Testing Bitcoin verification utility...');
try {
  const testAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Genesis block address
  const isValid = bitcoinVerify.isValidBitcoinAddress(testAddress);
  console.log(`✅ Bitcoin utility loaded - Address validation: ${isValid}`);
} catch (error) {
  console.log('❌ Bitcoin utility error:', error.message);
}

// Test 3: Solana verification utility
console.log('\n3️⃣ Testing Solana verification utility...');
try {
  const testAddress = '11111111111111111111111111111112'; // System program
  const isValid = solanaVerify.isValidSolanaAddress(testAddress);
  console.log(`✅ Solana utility loaded - Address validation: ${isValid}`);
} catch (error) {
  console.log('❌ Solana utility error:', error.message);
}

// Test 4: Hash computation
console.log('\n4️⃣ Testing hash computation...');
try {
  const testProof = {
    chain: 'bitcoin',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    signature: 'test-signature',
    nonce: 'test-nonce',
    verifiedAt: new Date().toISOString()
  };
  const hash = computeProofHash(testProof);
  console.log(`✅ Hash computation working - Hash: ${hash}`);
} catch (error) {
  console.log('❌ Hash computation error:', error.message);
}

// Test 5: IPFS service
console.log('\n5️⃣ Testing IPFS service...');
try {
  const status = ipfsService.getStatus();
  console.log(`✅ IPFS service loaded - Status:`, status);
} catch (error) {
  console.log('❌ IPFS service error:', error.message);
}

// Test 6: Express app
console.log('\n6️⃣ Testing Express app...');
try {
  const app = require('./index.js');
  console.log('✅ Express app loaded successfully');
} catch (error) {
  console.log('❌ Express app error:', error.message);
}

console.log('\n🎉 Setup test completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm start');
console.log('3. Test endpoints with curl or Postman');
console.log('\n🔗 Endpoints:');
console.log('- POST http://localhost:3000/challenge');
console.log('- POST http://localhost:3000/verify');
console.log('- GET  http://localhost:3000/health');

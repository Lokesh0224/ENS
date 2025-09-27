const nacl = require('tweetnacl');

/**
 * Solana signature verification utility
 * Verifies Ed25519 signatures for Solana addresses
 */

/**
 * Verifies a Solana signature
 * @param {string} address - Solana public key (base58 encoded)
 * @param {string} message - Original message that was signed
 * @param {string} signature - Base58 encoded signature
 * @returns {Promise<boolean>} - True if signature is valid
 */
async function verifySignature(address, message, signature) {
  try {
    console.log(`�� Verifying Solana signature for address: ${address}`);
    
    // Validate address format
    if (!isValidSolanaAddress(address)) {
      console.error('❌ Invalid Solana address format');
      return false;
    }

    // Convert base58 to Uint8Array
    const publicKeyBytes = base58ToUint8Array(address);
    const signatureBytes = base58ToUint8Array(signature);
    const messageBytes = new TextEncoder().encode(message);

    // Verify the signature using Ed25519
    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    
    if (isValid) {
      console.log('✅ Solana signature verification successful');
    } else {
      console.log('❌ Solana signature verification failed');
    }
    
    return isValid;

  } catch (error) {
    console.error('Solana verification error:', error);
    return false;
  }
}

/**
 * Validates Solana address format
 * @param {string} address - Solana address to validate
 * @returns {boolean} - True if address format is valid
 */
function isValidSolanaAddress(address) {
  try {
    // Solana addresses are base58 encoded and typically 32-44 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  } catch (error) {
    return false;
  }
}

/**
 * Converts base58 string to Uint8Array
 * @param {string} base58 - Base58 encoded string
 * @returns {Uint8Array} - Decoded bytes
 */
function base58ToUint8Array(base58) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const base = alphabet.length;
  
  let decoded = new Uint8Array(0);
  let num = 0n;
  let multi = 1n;
  
  // Convert base58 to bigint
  for (let i = base58.length - 1; i >= 0; i--) {
    const char = base58[i];
    const index = alphabet.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base58 character: ${char}`);
    }
    num += BigInt(index) * multi;
    multi *= BigInt(base);
  }
  
  // Convert bigint to bytes
  const bytes = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num = num / 256n;
  }
  
  // Handle leading zeros
  for (let i = 0; i < base58.length && base58[i] === '1'; i++) {
    bytes.unshift(0);
  }
  
  return new Uint8Array(bytes);
}

/**
 * Creates a message for signing (Solana standard format)
 * @param {string} message - Original message
 * @returns {string} - Formatted message for Solana signing
 */
function createSignableMessage(message) {
  // Solana typically uses the raw message for signing
  return message;
}

/**
 * Generates a keypair for testing (development only)
 * @returns {Object} - Keypair with publicKey and secretKey
 */
function generateKeypair() {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: uint8ArrayToBase58(keypair.publicKey),
    secretKey: uint8ArrayToBase58(keypair.secretKey)
  };
}

/**
 * Converts Uint8Array to base58 string
 * @param {Uint8Array} bytes - Bytes to encode
 * @returns {string} - Base58 encoded string
 */
function uint8ArrayToBase58(bytes) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const base = alphabet.length;
  
  let num = 0n;
  let multi = 1n;
  
  // Convert bytes to bigint
  for (let i = bytes.length - 1; i >= 0; i--) {
    num += BigInt(bytes[i]) * multi;
    multi *= 256n;
  }
  
  // Convert bigint to base58
  let result = '';
  while (num > 0n) {
    result = alphabet[Number(num % BigInt(base))] + result;
    num = num / BigInt(base);
  }
  
  // Handle leading zeros
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result = '1' + result;
  }
  
  return result;
}

module.exports = {
  verifySignature,
  isValidSolanaAddress,
  createSignableMessage,
  generateKeypair,
  base58ToUint8Array,
  uint8ArrayToBase58
};

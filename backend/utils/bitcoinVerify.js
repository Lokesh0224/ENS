const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

/**
 * Bitcoin signature verification utility
 * Verifies secp256k1 signatures for Bitcoin addresses
 */

/**
 * Verifies a Bitcoin signature
 * @param {string} address - Bitcoin address
 * @param {string} message - Original message that was signed
 * @param {string} signature - Base64 encoded signature
 * @returns {Promise<boolean>} - True if signature is valid
 */
async function verifySignature(address, message, signature) {
  try {
    console.log(`🔍 Verifying Bitcoin signature for address: ${address}`);
    
    // Validate address format
    if (!isValidBitcoinAddress(address)) {
      console.error('❌ Invalid Bitcoin address format');
      return false;
    }

    // Verify the signature
    const isValid = bitcoinMessage.verify(message, address, signature);
    
    if (isValid) {
      console.log('✅ Bitcoin signature verification successful');
    } else {
      console.log('❌ Bitcoin signature verification failed');
    }
    
    return isValid;

  } catch (error) {
    console.error('Bitcoin verification error:', error);
    return false;
  }
}

/**
 * Validates Bitcoin address format
 * @param {string} address - Bitcoin address to validate
 * @returns {boolean} - True if address format is valid
 */
function isValidBitcoinAddress(address) {
  try {
    // Check for common Bitcoin address formats
    const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/; // Legacy (P2PKH/P2SH)
    const bech32Regex = /^bc1[a-z0-9]{39,59}$/; // Bech32 (P2WPKH/P2WSH)
    const taprootRegex = /^bc1p[a-z0-9]{58}$/; // Taproot (P2TR)
    
    return legacyRegex.test(address) || bech32Regex.test(address) || taprootRegex.test(address);
  } catch (error) {
    return false;
  }
}

/**
 * Creates a message for signing (Bitcoin standard format)
 * @param {string} message - Original message
 * @returns {string} - Formatted message for Bitcoin signing
 */
function createSignableMessage(message) {
  return `\x18Bitcoin Signed Message:\n${message.length.toString().padStart(2, '0')}${message}`;
}

/**
 * Recovers public key from signature (if needed for advanced verification)
 * @param {string} message - Original message
 * @param {string} signature - Base64 encoded signature
 * @returns {string|null} - Recovered public key or null if failed
 */
function recoverPublicKey(message, signature) {
  try {
    const signableMessage = createSignableMessage(message);
    const messageHash = bitcoin.crypto.sha256(signableMessage);
    const signatureBuffer = Buffer.from(signature, 'base64');
    
    // This is a simplified version - in practice, you'd need more complex recovery
    return null; // Simplified for this implementation
  } catch (error) {
    console.error('Public key recovery error:', error);
    return null;
  }
}

module.exports = {
  verifySignature,
  isValidBitcoinAddress,
  createSignableMessage,
  recoverPublicKey
};

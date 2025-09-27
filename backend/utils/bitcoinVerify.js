const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

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


function createSignableMessage(message) {
  return `\x18Bitcoin Signed Message:\n${message.length.toString().padStart(2, '0')}${message}`;
}


function recoverPublicKey(message, signature) {
  try {
    const signableMessage = createSignableMessage(message);
    const messageHash = bitcoin.crypto.sha256(signableMessage);
    const signatureBuffer = Buffer.from(signature, 'base64');
    
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

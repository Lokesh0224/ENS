const keccak = require('keccak');

/**
 * Hash utility for computing proof hashes
 * Uses Keccak256 (same as Ethereum's keccak256)
 */

/**
 * Computes Keccak256 hash of a proof object
 * @param {Object} proof - Proof object to hash
 * @returns {string} - Hex-encoded hash with 0x prefix
 */
function computeProofHash(proof) {
  try {
    // Convert proof to JSON string
    const proofString = JSON.stringify(proof, Object.keys(proof).sort());
    
    // Compute Keccak256 hash
    const hash = keccak('keccak256').update(proofString).digest('hex');
    
    // Add 0x prefix for Ethereum compatibility
    return `0x${hash}`;
    
  } catch (error) {
    console.error('Hash computation error:', error);
    throw new Error('Failed to compute proof hash');
  }
}

/**
 * Computes Keccak256 hash of any string
 * @param {string} input - String to hash
 * @returns {string} - Hex-encoded hash with 0x prefix
 */
function computeHash(input) {
  try {
    const hash = keccak('keccak256').update(input).digest('hex');
    return `0x${hash}`;
  } catch (error) {
    console.error('Hash computation error:', error);
    throw new Error('Failed to compute hash');
  }
}

/**
 * Validates a proof hash format
 * @param {string} hash - Hash to validate
 * @returns {boolean} - True if hash format is valid
 */
function isValidHash(hash) {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Creates a deterministic hash from multiple inputs
 * @param {...string} inputs - Input strings to hash together
 * @returns {string} - Combined hash
 */
function combineHashes(...inputs) {
  const combined = inputs.join('|');
  return computeHash(combined);
}

module.exports = {
  computeProofHash,
  computeHash,
  isValidHash,
  combineHashes
};

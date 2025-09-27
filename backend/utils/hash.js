const keccak = require('keccak');


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


function computeHash(input) {
  try {
    const hash = keccak('keccak256').update(input).digest('hex');
    return `0x${hash}`;
  } catch (error) {
    console.error('Hash computation error:', error);
    throw new Error('Failed to compute hash');
  }
}

function isValidHash(hash) {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}


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

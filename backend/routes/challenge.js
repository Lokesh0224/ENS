const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { ensName, chain, address } = req.body;

    // Validate required fields
    if (!ensName || !chain || !address) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'ensName, chain, and address are required'
      });
    }

    // Validate chain type
    const supportedChains = ['bitcoin', 'solana'];
    if (!supportedChains.includes(chain.toLowerCase())) {
      return res.status(400).json({
        error: 'Unsupported chain',
        message: `Supported chains: ${supportedChains.join(', ')}`
      });
    }

    // Validate ENS name format (basic validation)
    if (!ensName.endsWith('.eth')) {
      return res.status(400).json({
        error: 'Invalid ENS name',
        message: 'ENS name must end with .eth'
      });
    }

    // Generate challenge
    const challenge = {
      ensName: ensName.toLowerCase(),
      chain: chain.toLowerCase(),
      address: address,
      nonce: uuidv4(),
      timestamp: new Date().toISOString(),
      purpose: 'bind-address-to-ens'
    };

    console.log(`📝 Generated challenge for ${ensName} on ${chain}: ${challenge.nonce}`);

    res.json(challenge);

  } catch (error) {
    console.error('Challenge generation error:', error);
    res.status(500).json({
      error: 'Failed to generate challenge',
      message: error.message
    });
  }
});

module.exports = router;

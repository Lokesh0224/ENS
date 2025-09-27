const express = require('express');
const bitcoinVerify = require('../utils/bitcoinVerify');
const solanaVerify = require('../utils/solanaVerify');
const ipfsService = require('../services/ipfs');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { chain, address, signature, nonce, message } = req.body;

    // Validate required fields
    if (!chain || !address || !signature || !nonce || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'chain, address, signature, nonce, and message are required'
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

    let isValid = false;

    // Verify signature based on chain
    if (chain.toLowerCase() === 'bitcoin') {
      isValid = await bitcoinVerify.verifySignature(address, message, signature);
    } else if (chain.toLowerCase() === 'solana') {
      isValid = await solanaVerify.verifySignature(address, message, signature);
    }

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid signature',
        message: 'Signature verification failed'
      });
    }

    // Create proof object
    const proof = {
      chain: chain.toLowerCase(),
      address: address,
      signature: signature,
      nonce: nonce,
      verifiedAt: new Date().toISOString()
    };

    // Upload proof to IPFS
    let ipfsHash = null;
    try {
      ipfsHash = await ipfsService.uploadProof(proof);
      console.log(`�� Proof uploaded to IPFS: ${ipfsHash}`);
    } catch (ipfsError) {
      console.warn('⚠️ IPFS upload failed, continuing with local storage:', ipfsError.message);
    }

    // Compute proof hash
    const proofHash = require('../utils/hash').computeProofHash(proof);

    console.log(`✅ Verification successful for ${address} on ${chain}`);
    console.log(`🔗 Proof hash: ${proofHash}`);

    res.json({
      success: true,
      proofHash: proofHash,
      ipfsHash: ipfsHash,
      metadata: {
        chain: chain.toLowerCase(),
        address: address,
        verifiedAt: proof.verifiedAt
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

module.exports = router;

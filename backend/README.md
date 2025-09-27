# Cross-Chain Identity Hub Backend

A backend verifier service for the Cross-Chain Identity Hub project that enables verification of blockchain addresses across different chains.

## Features

- **Multi-chain Support**: Bitcoin (secp256k1) and Solana (Ed25519) signature verification
- **Challenge-Response Flow**: Secure challenge generation and signature verification
- **IPFS Integration**: Proof storage with IPFS or local fallback
- **RESTful API**: Clean, well-documented endpoints
- **Extensible Architecture**: Easy to add new blockchain support

## Tech Stack

- **Node.js** + **Express** - Web framework
- **bitcoinjs-lib** + **bitcoinjs-message** - Bitcoin signature verification
- **tweetnacl** - Ed25519 signature verification for Solana
- **ipfs-http-client** - IPFS integration
- **keccak** - Hash computation

## API Endpoints

### POST /challenge
Generates a challenge for address verification.

**Request:**
```json
{
  "ensName": "alice.eth",
  "chain": "bitcoin",
  "address": "1abc...def"
}
```

**Response:**
```json
{
  "ensName": "alice.eth",
  "chain": "bitcoin",
  "address": "1abc...def",
  "nonce": "random-string",
  "timestamp": "2025-01-27T12:00:00.000Z",
  "purpose": "bind-address-to-ens"
}
```

### POST /verify
Verifies a signed message and returns proof hash.

**Request:**
```json
{
  "chain": "bitcoin",
  "address": "1abc...def",
  "signature": "3045...",
  "nonce": "challenge-nonce",
  "message": "original-message-that-was-signed"
}
```

**Response:**
```json
{
  "success": true,
  "proofHash": "0x...",
  "ipfsHash": "Qm...",
  "metadata": {
    "chain": "bitcoin",
    "address": "1abc...def",
    "verifiedAt": "2025-01-27T12:00:00.000Z"
  }
}
```

## Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `USE_REAL_IPFS` - Use real IPFS instead of local storage (default: false)
- `IPFS_ENDPOINT` - IPFS node endpoint (default: http://localhost:5001)
- `LOCAL_STORAGE_PATH` - Local storage path for mock IPFS (default: ./storage)

### IPFS Setup (Optional)

To use real IPFS instead of local storage:

1. **Install IPFS:**
```bash
# Install IPFS
npm install -g ipfs

# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon
```

2. **Configure environment:**
```bash
USE_REAL_IPFS=true
IPFS_ENDPOINT=http://localhost:5001
```

## Supported Chains

### Bitcoin
- **Signature Algorithm**: secp256k1
- **Address Formats**: Legacy (P2PKH/P2SH), Bech32 (P2WPKH/P2WSH), Taproot (P2TR)
- **Verification**: Uses `bitcoinjs-message` for signature verification

### Solana
- **Signature Algorithm**: Ed25519
- **Address Format**: Base58 encoded public keys
- **Verification**: Uses `tweetnacl` for Ed25519 signature verification

## Architecture

```
backend/
├── index.js              # Main Express application
├── routes/
│   ├── challenge.js      # Challenge generation endpoint
│   └── verify.js         # Signature verification endpoint
├── utils/
│   ├── bitcoinVerify.js  # Bitcoin signature verification
│   ├── solanaVerify.js   # Solana signature verification
│   └── hash.js           # Hash computation utilities
├── services/
│   └── ipfs.js           # IPFS integration service
└── package.json          # Dependencies and scripts
```

## Adding New Chains

To add support for a new blockchain:

1. **Create verification utility** in `utils/[chain]Verify.js`
2. **Implement signature verification** for the chain's signature algorithm
3. **Update supported chains** in route validation
4. **Add chain-specific logic** in the verify route

Example structure:
```javascript
// utils/ethereumVerify.js
const ethers = require('ethers');

async function verifySignature(address, message, signature) {
  // Ethereum signature verification logic
  return ethers.utils.verifyMessage(message, signature) === address;
}

module.exports = { verifySignature };
```

## Security Considerations

- **Input Validation**: All inputs are validated and sanitized
- **Signature Verification**: Cryptographic verification of signatures
- **Rate Limiting**: Consider adding rate limiting for production
- **CORS**: Configurable CORS settings
- **Helmet**: Security headers via Helmet middleware

## Development

### Running Tests
```bash
# Add your test framework and run tests
npm test
```

### Code Quality
```bash
# Add linting
npm run lint

# Add formatting
npm run format
```

## License

MIT License - see LICENSE file for details.

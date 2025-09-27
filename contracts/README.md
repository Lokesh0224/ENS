# Cross-Chain Identity Hub - Smart Contracts

ENS-compatible resolver contracts for cross-chain identity verification using Solidity and Foundry.

## Overview

This repository contains smart contracts that enable ENS name owners to bind verified addresses from different blockchains (Bitcoin, Solana, Ethereum, etc.) to their ENS names. The contracts provide a secure, decentralized way to manage cross-chain identity verification.

## Features

- **ENS Compatibility**: Full compatibility with ENS registry and resolver standards
- **Multi-Chain Support**: Support for Bitcoin, Solana, Ethereum, and other blockchains
- **Access Control**: Only ENS name owners can set verified addresses
- **Proof Verification**: Cryptographic proof hashes for verification integrity
- **Gas Optimized**: Efficient storage and retrieval of verified addresses
- **Extensible**: Easy to add support for new blockchains

## Contract Architecture

### CrossChainResolver

The main contract that implements the cross-chain identity resolution functionality.

**Key Functions:**
- `setVerifiedAddress()` - Set a verified address for a specific chain (owner only)
- `getVerifiedAddress()` - Retrieve verified address information
- `removeVerifiedAddress()` - Remove a verified address (owner only)
- `getNodeChainIds()` - Get all chain IDs for a node
- `getVerifiedAddressCount()` - Get the number of verified addresses

**Data Structure:**
```solidity
struct VerifiedAddress {
    string addr;        // The verified address on the specified chain
    bytes32 proofHash;  // Hash of the verification proof
    uint256 verifiedAt; // Timestamp when the address was verified
}
```

## Project Structure

```
contracts/
├── CrossChainResolver.sol          # Main resolver contract
├── lib/
│   └── ens/
│       └── IENSRegistry.sol       # ENS Registry interface
├── script/
│   └── Deploy.s.sol              # Foundry deployment script
├── test/
│   └── Resolver.t.sol            # Comprehensive unit tests
├── foundry.toml                  # Foundry configuration
└── README.md                     # This file
```

## Installation

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) - Solidity development framework
- [Node.js](https://nodejs.org/) - For additional tooling (optional)

### Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd contracts
```

2. **Install Foundry dependencies:**
```bash
forge install
```

3. **Build the contracts:**
```bash
forge build
```

4. **Run tests:**
```bash
forge test
```

## Usage

### Deployment

#### Sepolia Testnet

1. **Set up environment variables:**
```bash
export PRIVATE_KEY="your-private-key"
export INFURA_API_KEY="your-infura-key"
export ETHERSCAN_API_KEY="your-etherscan-key"
```

2. **Deploy to Sepolia:**
```bash
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

#### Local Development

1. **Start local Anvil node:**
```bash
anvil
```

2. **Deploy locally:**
```bash
forge script script/Deploy.s.sol:Deploy --fork-url http://localhost:8545 --broadcast
```

### Integration

#### Setting a Verified Address

```solidity
// 1. Set the resolver for your ENS name (if not already set)
ensRegistry.setResolver(node, resolverAddress);

// 2. Set verified address
resolver.setVerifiedAddress(
    node,           // ENS node hash
    "bitcoin",      // Chain ID
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", // Bitcoin address
    proofHash,      // Proof hash from backend
    block.timestamp // Verification timestamp
);
```

#### Querying Verified Addresses

```solidity
// Get verified address for a specific chain
(string memory addr, bytes32 proofHash, uint256 verifiedAt) = 
    resolver.getVerifiedAddress(node, "bitcoin");

// Get all chain IDs for a node
string[] memory chainIds = resolver.getNodeChainIds(node);

// Check if verified address exists
bool exists = resolver.hasVerifiedAddressForChain(node, "bitcoin");
```

## Testing

### Run All Tests

```bash
forge test
```

### Run Tests with Verbose Output

```bash
forge test -vvv
```

### Run Specific Test

```bash
forge test --match-test testSetVerifiedAddressByOwner
```

### Gas Reporting

```bash
forge test --gas-report
```

### Coverage Report

```bash
forge coverage
```

## Security Considerations

### Access Control

- Only ENS name owners can set/remove verified addresses
- Ownership is verified through the ENS Registry
- No admin functions or backdoors

### Data Integrity

- All data is stored on-chain and immutable
- Proof hashes provide cryptographic verification
- Timestamps prevent replay attacks

### Gas Optimization

- Efficient storage patterns
- Minimal external calls
- Optimized for batch operations

## Supported Chains

| Chain | Chain ID | Address Format | Signature Algorithm |
|-------|----------|----------------|-------------------|
| Bitcoin | `bitcoin`` | Legacy/Bech32/Taproot | secp256k1 |
| Solana | `solana` | Base58 | Ed25519 |
| Ethereum | `ethereum` | Hex (0x...) | secp256k1 |
| Polygon | `polygon` | Hex (0x...) | secp256k1 |

## Development

### Adding New Chains

To add support for a new blockchain:

1. **Update the documentation** with the new chain information
2. **Add test cases** for the new chain
3. **Update the backend** to support the new chain's signature verification
4. **Deploy and test** the updated contracts

### Code Style

- Follow Solidity style guide
- Use NatSpec documentation
- Include comprehensive tests
- Optimize for gas efficiency

## Deployment Addresses

### Sepolia Testnet

- **CrossChainResolver**: `TBD` (deploy to get address)
- **ENS Registry**: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`

### Mainnet (Future)

- **CrossChainResolver**: `TBD`
- **ENS Registry**: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## Support

For questions and support:

- Create an issue on GitHub
- Join our Discord community
- Check the documentation

## Roadmap

- [ ] Support for more blockchains
- [ ] Batch operations for multiple addresses
- [ ] Integration with popular wallets
- [ ] Mobile SDK for easy integration
- [ ] Analytics and monitoring tools

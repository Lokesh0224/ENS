# Cross-Chain Identity Hub - Deployment Guide

## Quick Start

### 1. Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Sepolia testnet ETH for gas fees
- Private key with testnet ETH

### 2. Environment Setup

```bash
# Set your private key
export PRIVATE_KEY="your-private-key-here"

# Set API keys (optional, for verification)
export INFURA_API_KEY="your-infura-key"
export ETHERSCAN_API_KEY="your-etherscan-key"
```

### 3. Build and Test

```bash
# Build contracts
forge build

# Run tests
forge test

# Run tests with gas report
forge test --gas-report
```

### 4. Deploy to Sepolia

```bash
# Deploy to Sepolia testnet
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify

# Deploy with custom ENS Registry
forge script script/Deploy.s.sol:Deploy --sig "runWithCustomRegistry(address)" 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e --rpc-url sepolia --broadcast
```

### 5. Verify Deployment

```bash
# Check deployment status
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
```

## Contract Addresses

### Sepolia Testnet

- **CrossChainResolver**: `TBD` (deploy to get address)
- **ENS Registry**: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`

## Usage Examples

### Setting a Verified Address

```solidity
// 1. Set resolver for your ENS name
ensRegistry.setResolver(node, resolverAddress);

// 2. Set verified address
resolver.setVerifiedAddress(
    node,                    // ENS node hash
    "bitcoin",              // Chain ID
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", // Address
    proofHash,              // Proof hash from backend
    block.timestamp         // Verification timestamp
);
```

### Querying Verified Addresses

```solidity
// Get verified address
(string memory addr, bytes32 proofHash, uint256 verifiedAt) = 
    resolver.getVerifiedAddress(node, "bitcoin");

// Get all chain IDs
string[] memory chainIds = resolver.getNodeChainIds(node);

// Check if address exists
bool exists = resolver.hasVerifiedAddressForChain(node, "bitcoin");
```

## Integration with Backend

1. **User requests challenge**: `POST /challenge`
2. **User signs challenge** with their wallet
3. **User submits signature**: `POST /verify`
4. **Backend verifies** and returns proof hash
5. **User calls contract**: `setVerifiedAddress()`

## Security Considerations

- Only ENS name owners can set/remove verified addresses
- All data is stored on-chain and immutable
- Proof hashes provide cryptographic verification
- No admin functions or backdoors

## Gas Costs

- `setVerifiedAddress()`: ~50,000 gas
- `getVerifiedAddress()`: ~2,000 gas (view function)
- `removeVerifiedAddress()`: ~30,000 gas

## Troubleshooting

### Common Issues

1. **"NotNodeOwner" error**: Ensure you're the owner of the ENS name
2. **"EmptyAddress" error**: Provide a valid address string
3. **"EmptyChainId" error**: Provide a valid chain ID string
4. **"VerifiedAddressNotFound" error**: Check if the address exists first

### Debug Commands

```bash
# Check contract state
cast call $RESOLVER_ADDRESS "getENSRegistry()" --rpc-url sepolia

# Check node owner
cast call $ENS_REGISTRY "owner(bytes32)" $NODE_HASH --rpc-url sepolia

# Check verified address
cast call $RESOLVER_ADDRESS "getVerifiedAddress(bytes32,string)" $NODE_HASH "bitcoin" --rpc-url sepolia
```

## Next Steps

1. Deploy the contract to Sepolia
2. Set up your ENS name with the resolver
3. Integrate with the backend verification service
4. Test the complete flow
5. Deploy to mainnet when ready

## Support

For questions and support:
- Create an issue on GitHub
- Check the documentation
- Join our Discord community

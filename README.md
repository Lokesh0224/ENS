# 🌐 Cross-Chain Identity Hub

**Link Your Decentralized Identity Across All Networks**

The Cross-Chain Identity Hub is a foundational infrastructure project that links multiple blockchain addresses (Ethereum, Solana, Bitcoin, etc.) to a single, verifiable identity. This enables true cross-chain ownership verification and identity resolution for seamless multi-chain interactions.

---

## 📁 Project Structure

```
cross-chain-identity-hub/
├── backend/           # Node.js API server for verification
├── contracts/         # Solidity smart contracts
└── frontend/          # React user interface
```

**Architecture Overview:**
- **Backend**: Challenge generation, proof verification, ENS resolution
- **Contracts**: On-chain storage and verification logic
- **Frontend**: User interface for identity linking and management

---

## 🛠️ Technology Stack

| Component | Technologies | Purpose |
|-----------|-------------|---------|
| **Frontend** | React, TypeScript, Tailwind CSS, Lucide Icons | User interface and interactions |
| **Backend** | Node.js, Express, Ethers.js, Crypto libraries | API endpoints and verification logic |
| **Smart Contracts** | Solidity, Foundry | On-chain storage and proof verification |
| **Wallet Integration** | Ethers.js, Solana Web3.js | Multi-chain wallet connectivity |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Git
- Foundry (for smart contracts)

### 1. Clone Repository
```bash
git clone https://github.com/your-org/cross-chain-identity-hub.git
cd cross-chain-identity-hub
```

### 2. Backend Setup
```bash
cd backend
npm install
./start.sh
```

The API server will start on `http://localhost:3000`

**Test the API:**
```bash
# Health check
curl http://localhost:3000/health

# Run example test
node examples/api-test.js
```

### 3. Smart Contracts
```bash
cd contracts
forge install
forge build
forge test
```

**Deploy to testnet:**
```bash
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

Access the application at `http://localhost:3000`

---

## 📡 API Reference

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/health` | GET | Health check | `curl http://localhost:3000/health` |
| `/challenge` | POST | Generate identity challenge | See below |
| `/verify` | POST | Verify proof submission | See examples/ |

**Generate Challenge Example:**
```bash
curl -X POST http://localhost:3000/challenge \
  -H "Content-Type: application/json" \
  -d '{
    "ensName": "alice.eth",
    "chain": "bitcoin", 
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
  }'
```

---

## 🔧 Development Commands

### Smart Contracts (Foundry)
```bash
# Build contracts
forge build

# Run tests
forge test

# Generate gas report
forge test --gas-report

# Coverage analysis
forge coverage

# Clean artifacts
forge clean
```

### Backend
```bash
# Start development server
npm run dev

# Run tests
npm test

# Generate API documentation
npm run docs
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run type-check
```

---

## 🔍 Example: Identity Resolution

A successfully linked identity in the Cross-Chain Identity Hub:

```yaml
ENS Name: vitalik.eth
Blockchain: Ethereum (Ξ)

Details:
  Resolved Address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
  Proof Hash: 0xe8532100...afddd408
  Verification Method: ENS Registry
  Verified On: Sep 28, 2025, 12:20 AM
  Status: ✅ Verified
```

**Multi-Chain Linking:**
- **Ethereum**: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
- **Solana**: `DRiP2Pn2K6fuMLKQmt5rZWyHiUZ6ygcT4s3FzMyK3qK`
- **Bitcoin**: `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`

---

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd backend && npm test

# Contract tests
cd contracts && forge test

# Frontend tests  
cd frontend && npm test
```


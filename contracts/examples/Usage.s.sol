// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../CrossChainResolver.sol";
import "../lib/ens/IENSRegistry.sol";

/**
 * @title UsageExample
 * @dev Example script demonstrating how to use CrossChainResolver
 * @notice Shows how to set and query verified addresses
 * @author Cross-Chain Identity Hub
 */
contract UsageExample is Script {
    // ============ State Variables ============
    
    CrossChainResolver public resolver;
    IENSRegistry public ensRegistry;
    
    // Example data
    bytes32 public constant EXAMPLE_NODE = keccak256("alice.eth");
    address public constant EXAMPLE_OWNER = address(0x1234567890123456789012345678901234567890);
    
    // ============ Functions ============
    
    /**
     * @dev Example of setting verified addresses
     */
    function run() external {
        // This would be called after deployment
        // address resolverAddress = 0x...; // Deployed resolver address
        // address ensRegistryAddress = 0x...; // ENS Registry address
        
        // resolver = CrossChainResolver(resolverAddress);
        // ensRegistry = IENSRegistry(ensRegistryAddress);
        
        console.log("📋 CrossChainResolver Usage Example");
        console.log("=====================================");
        
        _demonstrateSettingAddresses();
        _demonstrateQueryingAddresses();
        _demonstrateRemovingAddresses();
    }
    
    /**
     * @dev Demonstrate setting verified addresses
     */
    function _demonstrateSettingAddresses() internal {
        console.log("\n🔗 Setting Verified Addresses");
        console.log("-------------------------------");
        
        // Example: Set Bitcoin address
        console.log("Setting Bitcoin address...");
        // resolver.setVerifiedAddress(
        //     EXAMPLE_NODE,
        //     "bitcoin",
        //     "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        //     keccak256("bitcoin-proof"),
        //     block.timestamp
        // );
        console.log("✅ Bitcoin address set");
        
        // Example: Set Solana address
        console.log("Setting Solana address...");
        // resolver.setVerifiedAddress(
        //     EXAMPLE_NODE,
        //     "solana",
        //     "11111111111111111111111111111112",
        //     keccak256("solana-proof"),
        //     block.timestamp
        // );
        console.log("✅ Solana address set");
        
        // Example: Set Ethereum address
        console.log("Setting Ethereum address...");
        // resolver.setVerifiedAddress(
        //     EXAMPLE_NODE,
        //     "ethereum",
        //     "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        //     keccak256("ethereum-proof"),
        //     block.timestamp
        // );
        console.log("✅ Ethereum address set");
    }
    
    /**
     * @dev Demonstrate querying verified addresses
     */
    function _demonstrateQueryingAddresses() internal {
        console.log("\n🔍 Querying Verified Addresses");
        console.log("-------------------------------");
        
        // Example: Get Bitcoin address
        console.log("Getting Bitcoin address...");
        // (string memory addr, bytes32 proofHash, uint256 verifiedAt) = 
        //     resolver.getVerifiedAddress(EXAMPLE_NODE, "bitcoin");
        // console.log("Address:", addr);
        // console.log("Proof Hash:", vm.toString(proofHash));
        // console.log("Verified At:", verifiedAt);
        
        // Example: Get all chain IDs
        console.log("Getting all chain IDs...");
        // string[] memory chainIds = resolver.getNodeChainIds(EXAMPLE_NODE);
        // console.log("Chain IDs count:", chainIds.length);
        // for (uint i = 0; i < chainIds.length; i++) {
        //     console.log("Chain ID:", chainIds[i]);
        // }
        
        // Example: Check if address exists
        console.log("Checking if Bitcoin address exists...");
        // bool exists = resolver.hasVerifiedAddressForChain(EXAMPLE_NODE, "bitcoin");
        // console.log("Exists:", exists);
    }
    
    /**
     * @dev Demonstrate removing verified addresses
     */
    function _demonstrateRemovingAddresses() internal {
        console.log("\n🗑️ Removing Verified Addresses");
        console.log("--------------------------------");
        
        // Example: Remove Bitcoin address
        console.log("Removing Bitcoin address...");
        // resolver.removeVerifiedAddress(EXAMPLE_NODE, "bitcoin");
        console.log("✅ Bitcoin address removed");
        
        // Verify it was removed
        console.log("Checking if Bitcoin address still exists...");
        // bool exists = resolver.hasVerifiedAddressForChain(EXAMPLE_NODE, "bitcoin");
        // console.log("Exists:", exists);
    }
    
    /**
     * @dev Example of integration with backend verification
     */
    function demonstrateBackendIntegration() external {
        console.log("\n🔗 Backend Integration Example");
        console.log("-------------------------------");
        
        console.log("1. User requests challenge from backend");
        console.log("   POST /challenge");
        console.log("   {");
        console.log("     \"ensName\": \"alice.eth\",");
        console.log("     \"chain\": \"bitcoin\",");
        console.log("     \"address\": \"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\"");
        console.log("   }");
        
        console.log("\n2. Backend returns challenge");
        console.log("   {");
        console.log("     \"ensName\": \"alice.eth\",");
        console.log("     \"chain\": \"bitcoin\",");
        console.log("     \"address\": \"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\",");
        console.log("     \"nonce\": \"random-string\",");
        console.log("     \"timestamp\": \"2025-01-27T12:00:00.000Z\",");
        console.log("     \"purpose\": \"bind-address-to-ens\"");
        console.log("   }");
        
        console.log("\n3. User signs challenge with wallet");
        console.log("   Wallet signs the challenge message");
        
        console.log("\n4. User submits signed message to backend");
        console.log("   POST /verify");
        console.log("   {");
        console.log("     \"chain\": \"bitcoin\",");
        console.log("     \"address\": \"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\",");
        console.log("     \"signature\": \"3045...\",");
        console.log("     \"nonce\": \"random-string\",");
        console.log("     \"message\": \"challenge-message\"");
        console.log("   }");
        
        console.log("\n5. Backend verifies signature and returns proof");
        console.log("   {");
        console.log("     \"success\": true,");
        console.log("     \"proofHash\": \"0x...\",");
        console.log("     \"ipfsHash\": \"Qm...\",");
        console.log("     \"metadata\": {");
        console.log("       \"chain\": \"bitcoin\",");
        console.log("       \"address\": \"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\",");
        console.log("       \"verifiedAt\": \"2025-01-27T12:00:00.000Z\"");
        console.log("     }");
        console.log("   }");
        
        console.log("\n6. User calls setVerifiedAddress on contract");
        console.log("   resolver.setVerifiedAddress(");
        console.log("     node,");
        console.log("     \"bitcoin\",");
        console.log("     \"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\",");
        console.log("     proofHash,");
        console.log("     verifiedAt");
        console.log("   );");
        
        console.log("\n7. Anyone can now query the verified address");
        console.log("   (string memory addr, bytes32 proofHash, uint256 verifiedAt) =");
        console.log("     resolver.getVerifiedAddress(node, \"bitcoin\");");
    }
}

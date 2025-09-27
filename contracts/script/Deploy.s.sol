// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../CrossChainResolver.sol";
import "../lib/ens/IENSRegistry.sol";

/**
 * @title Deploy
 * @dev Foundry deployment script for CrossChainResolver
 * @notice Deploys the CrossChainResolver contract to Sepolia testnet
 * @author Cross-Chain Identity Hub
 */
contract Deploy is Script {
    // ============ State Variables ============
    
    /// @dev ENS Registry address on Sepolia testnet
    address constant SEPOLIA_ENS_REGISTRY = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;
    
    /// @dev CrossChainResolver contract instance
    CrossChainResolver public resolver;
    
    // ============ Events ============
    
    /**
     * @dev Emitted when the resolver is deployed
     * @param resolver The deployed resolver address
     * @param ensRegistry The ENS registry address
     */
    event ResolverDeployed(address indexed resolver, address indexed ensRegistry);

    // ============ Functions ============
    
    /**
     * @dev Main deployment function
     * @notice Deploys CrossChainResolver with Sepolia ENS Registry
     */
    function run() external {
        // Get the private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the CrossChainResolver
        resolver = new CrossChainResolver(SEPOLIA_ENS_REGISTRY);
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("CrossChainResolver deployed successfully!");
        console.log("Resolver address:", address(resolver));
        console.log("ENS Registry address:", SEPOLIA_ENS_REGISTRY);
        console.log("Network: Sepolia Testnet");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        // Emit deployment event
        emit ResolverDeployed(address(resolver), SEPOLIA_ENS_REGISTRY);
        
        // Verify deployment
        _verifyDeployment();
    }
    
    /**
     * @dev Deploy with custom ENS Registry address
     * @param ensRegistry The ENS Registry address to use
     */
    function runWithCustomRegistry(address ensRegistry) external {
        require(ensRegistry != address(0), "Invalid ENS Registry address");
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        resolver = new CrossChainResolver(ensRegistry);
        
        vm.stopBroadcast();
        
        console.log("CrossChainResolver deployed with custom registry!");
        console.log("Resolver address:", address(resolver));
        console.log("ENS Registry address:", ensRegistry);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        emit ResolverDeployed(address(resolver), ensRegistry);
        
        _verifyDeployment();
    }
    
    /**
     * @dev Deploy to local Anvil network
     * @notice Useful for local testing and development
     */
    function runLocal() external {
        // For local deployment, we'll use a mock ENS Registry
        // In a real scenario, you'd deploy a mock ENS Registry first
        address mockENSRegistry = address(0x1234567890123456789012345678901234567890);
        
        vm.startBroadcast();
        
        resolver = new CrossChainResolver(mockENSRegistry);
        
        vm.stopBroadcast();
        
        console.log("CrossChainResolver deployed locally!");
        console.log("Resolver address:", address(resolver));
        console.log("Mock ENS Registry address:", mockENSRegistry);
        console.log("Network: Local Anvil");
        
        emit ResolverDeployed(address(resolver), mockENSRegistry);
    }
    
    /**
     * @dev Verify the deployment by checking contract state
     */
    function _verifyDeployment() internal view {
        require(address(resolver) != address(0), "Resolver deployment failed");
        require(resolver.getENSRegistry() != address(0), "ENS Registry not set");
        
        console.log("Deployment verification passed");
        console.log("Next steps:");
        console.log("1. Set the resolver for your ENS name:");
        console.log("   ensRegistry.setResolver(node, address(resolver))");
        console.log("2. Set verified addresses:");
        console.log("   resolver.setVerifiedAddress(node, chainId, addr, proofHash, verifiedAt)");
        console.log("3. Query verified addresses:");
        console.log("   resolver.getVerifiedAddress(node, chainId)");
    }
    
    /**
     * @dev Get deployment information
     * @return resolverAddress The deployed resolver address
     * @return ensRegistryAddress The ENS registry address
     * @return deployerAddress The deployer address
     */
    function getDeploymentInfo() external view returns (
        address resolverAddress,
        address ensRegistryAddress,
        address deployerAddress
    ) {
        return (
            address(resolver),
            resolver.getENSRegistry(),
            vm.addr(vm.envUint("PRIVATE_KEY"))
        );
    }
}

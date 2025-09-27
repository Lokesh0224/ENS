// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../CrossChainResolver.sol";
import "../lib/ens/IENSRegistry.sol";

/**
 * @title ResolverTest
 * @dev Comprehensive unit tests for CrossChainResolver contract
 * @notice Tests all functionality including access control, data storage, and edge cases
 * @author Cross-Chain Identity Hub
 */
contract ResolverTest is Test {
    // ============ State Variables ============
    
    CrossChainResolver public resolver;
    MockENSRegistry public mockRegistry;
    
    // Test data
    bytes32 public constant TEST_NODE = keccak256("alice.eth");
    bytes32 public constant TEST_NODE_2 = keccak256("bob.eth");
    address public constant NODE_OWNER = address(0x1);
    address public constant NON_OWNER = address(0x2);
    
    string public constant BITCOIN_CHAIN = "bitcoin";
    string public constant SOLANA_CHAIN = "solana";
    string public constant ETHEREUM_CHAIN = "ethereum";
    
    string public constant BITCOIN_ADDR = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    string public constant SOLANA_ADDR = "11111111111111111111111111111112";
    string public constant ETHEREUM_ADDR = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
    
    bytes32 public constant PROOF_HASH_1 = keccak256("proof1");
    bytes32 public constant PROOF_HASH_2 = keccak256("proof2");
    bytes32 public constant PROOF_HASH_3 = keccak256("proof3");
    
    uint256 public constant VERIFIED_AT_1 = 1640995200; // 2022-01-01 00:00:00 UTC
    uint256 public constant VERIFIED_AT_2 = 1641081600; // 2022-01-02 00:00:00 UTC
    uint256 public constant VERIFIED_AT_3 = 1641168000; // 2022-01-03 00:00:00 UTC

    // ============ Events ============
    
    event VerifiedAddressSet(
        bytes32 indexed node,
        string indexed chainId,
        string addr,
        bytes32 proofHash,
        uint256 verifiedAt
    );
    
    event VerifiedAddressRemoved(
        bytes32 indexed node,
        string indexed chainId
    );

    // ============ Setup ============
    
    function setUp() public {
        // Deploy mock ENS Registry
        mockRegistry = new MockENSRegistry();
        
        // Deploy CrossChainResolver
        resolver = new CrossChainResolver(address(mockRegistry));
        
        // Set up mock registry to return NODE_OWNER as the owner of TEST_NODE
        mockRegistry.setOwner(TEST_NODE, NODE_OWNER);
        mockRegistry.setOwner(TEST_NODE_2, NODE_OWNER);
    }

    // ============ Test Cases ============
    
    /**
     * @dev Test successful deployment
     */
    function testDeployment() public {
        assertEq(address(resolver.getENSRegistry()), address(mockRegistry));
        assertEq(resolver.getNodeOwner(TEST_NODE), NODE_OWNER);
    }
    
    /**
     * @dev Test setting verified address by node owner
     */
    function testSetVerifiedAddressByOwner() public {
        vm.prank(NODE_OWNER);
        
        vm.expectEmit(true, true, false, true);
        emit VerifiedAddressSet(TEST_NODE, BITCOIN_CHAIN, BITCOIN_ADDR, PROOF_HASH_1, VERIFIED_AT_1);
        
        resolver.setVerifiedAddress(
            TEST_NODE,
            BITCOIN_CHAIN,
            BITCOIN_ADDR,
            PROOF_HASH_1,
            VERIFIED_AT_1
        );
        
        // Verify the address was set correctly
        (string memory addr, bytes32 proofHash, uint256 verifiedAt) = resolver.getVerifiedAddress(TEST_NODE, BITCOIN_CHAIN);
        assertEq(addr, BITCOIN_ADDR);
        assertEq(proofHash, PROOF_HASH_1);
        assertEq(verifiedAt, VERIFIED_AT_1);
        
        // Verify hasVerifiedAddress mapping
        assertTrue(resolver.hasVerifiedAddressForChain(TEST_NODE, BITCOIN_CHAIN));
        assertEq(resolver.getVerifiedAddressCount(TEST_NODE), 1);
        
        // Verify chain ID is in the list
        string[] memory chainIds = resolver.getNodeChainIds(TEST_NODE);
        assertEq(chainIds.length, 1);
        assertEq(chainIds[0], BITCOIN_CHAIN);
    }
    
    /**
     * @dev Test setting verified address by non-owner (should fail)
     */
    function testSetVerifiedAddressByNonOwner() public {
        vm.prank(NON_OWNER);
        
        vm.expectRevert(abi.encodeWithSelector(CrossChainResolver.NotNodeOwner.selector, TEST_NODE, NON_OWNER));
        
        resolver.setVerifiedAddress(
            TEST_NODE,
            BITCOIN_CHAIN,
            BITCOIN_ADDR,
            PROOF_HASH_1,
            VERIFIED_AT_1
        );
    }
    
    /**
     * @dev Test setting empty address (should fail)
     */
    function testSetEmptyAddress() public {
        vm.prank(NODE_OWNER);
        
        vm.expectRevert(CrossChainResolver.EmptyAddress.selector);
        
        resolver.setVerifiedAddress(
            TEST_NODE,
            BITCOIN_CHAIN,
            "", // Empty address
            PROOF_HASH_1,
            VERIFIED_AT_1
        );
    }
    
    /**
     * @dev Test setting empty chain ID (should fail)
     */
    function testSetEmptyChainId() public {
        vm.prank(NODE_OWNER);
        
        vm.expectRevert(CrossChainResolver.EmptyChainId.selector);
        
        resolver.setVerifiedAddress(
            TEST_NODE,
            "", // Empty chain ID
            BITCOIN_ADDR,
            PROOF_HASH_1,
            VERIFIED_AT_1
        );
    }
    
    /**
     * @dev Test getting non-existent verified address (should fail)
     */
    function testGetNonExistentVerifiedAddress() public {
        vm.expectRevert(abi.encodeWithSelector(CrossChainResolver.VerifiedAddressNotFound.selector, TEST_NODE, BITCOIN_CHAIN));
        
        resolver.getVerifiedAddress(TEST_NODE, BITCOIN_CHAIN);
    }
    
    /**
     * @dev Test setting multiple verified addresses for different chains
     */
    function testSetMultipleVerifiedAddresses() public {
        vm.startPrank(NODE_OWNER);
        
        // Set Bitcoin address
        resolver.setVerifiedAddress(TEST_NODE, BITCOIN_CHAIN, BITCOIN_ADDR, PROOF_HASH_1, VERIFIED_AT_1);
        
        // Set Solana address
        resolver.setVerifiedAddress(TEST_NODE, SOLANA_CHAIN, SOLANA_ADDR, PROOF_HASH_2, VERIFIED_AT_2);
        
        // Set Ethereum address
        resolver.setVerifiedAddress(TEST_NODE, ETHEREUM_CHAIN, ETHEREUM_ADDR, PROOF_HASH_3, VERIFIED_AT_3);
        
        vm.stopPrank();
        
        // Verify all addresses were set
        assertTrue(resolver.hasVerifiedAddressForChain(TEST_NODE, BITCOIN_CHAIN));
        assertTrue(resolver.hasVerifiedAddressForChain(TEST_NODE, SOLANA_CHAIN));
        assertTrue(resolver.hasVerifiedAddressForChain(TEST_NODE, ETHEREUM_CHAIN));
        
        // Verify count
        assertEq(resolver.getVerifiedAddressCount(TEST_NODE), 3);
        
        // Verify chain IDs list
        string[] memory chainIds = resolver.getNodeChainIds(TEST_NODE);
        assertEq(chainIds.length, 3);
        
        // Verify individual addresses
        (string memory addr, bytes32 proofHash, uint256 verifiedAt) = resolver.getVerifiedAddress(TEST_NODE, BITCOIN_CHAIN);
        assertEq(addr, BITCOIN_ADDR);
        assertEq(proofHash, PROOF_HASH_1);
        assertEq(verifiedAt, VERIFIED_AT_1);
    }
    
    /**
     * @dev Test updating existing verified address
     */
    function testUpdateVerifiedAddress() public {
        vm.startPrank(NODE_OWNER);
        
        // Set initial address
        resolver.setVerifiedAddress(TEST_NODE, BITCOIN_CHAIN, BITCOIN_ADDR, PROOF_HASH_1, VERIFIED_AT_1);
        
        // Update with new data
        string memory newAddr = "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy";
        bytes32 newProofHash = keccak256("newproof");
        uint256 newVerifiedAt = VERIFIED_AT_2;
        
        resolver.setVerifiedAddress(TEST_NODE, BITCOIN_CHAIN, newAddr, newProofHash, newVerifiedAt);
        
        vm.stopPrank();
        
        // Verify the address was updated
        (string memory addr, bytes32 proofHash, uint256 verifiedAt) = resolver.getVerifiedAddress(TEST_NODE, BITCOIN_CHAIN);
        assertEq(addr, newAddr);
        assertEq(proofHash, newProofHash);
        assertEq(verifiedAt, newVerifiedAt);
        
        // Verify count didn't change
        assertEq(resolver.getVerifiedAddressCount(TEST_NODE), 1);
    }
    
    /**
     * @dev Test removing verified address by owner
     */
    function testRemoveVerifiedAddressByOwner() public {
        vm.startPrank(NODE_OWNER);
        
        // Set verified address
        resolver.setVerifiedAddress(TEST_NODE, BITCOIN_CHAIN, BITCOIN_ADDR, PROOF_HASH_1, VERIFIED_AT_1);
        
        // Remove it
        vm.expectEmit(true, true, false, false);
        emit VerifiedAddressRemoved(TEST_NODE, BITCOIN_CHAIN);
        
        resolver.removeVerifiedAddress(TEST_NODE, BITCOIN_CHAIN);
        
        vm.stopPrank();
        
        // Verify it was removed
        assertFalse(resolver.hasVerifiedAddressForChain(TEST_NODE, BITCOIN_CHAIN));
        assertEq(resolver.getVerifiedAddressCount(TEST_NODE), 0);
        
        // Verify getting it fails
        vm.expectRevert(abi.encodeWithSelector(CrossChainResolver.VerifiedAddressNotFound.selector, TEST_NODE, BITCOIN_CHAIN));
        resolver.getVerifiedAddress(TEST_NODE, BITCOIN_CHAIN);
    }
    
    /**
     * @dev Test removing verified address by non-owner (should fail)
     */
    function testRemoveVerifiedAddressByNonOwner() public {
        vm.prank(NODE_OWNER);
        resolver.setVerifiedAddress(TEST_NODE, BITCOIN_CHAIN, BITCOIN_ADDR, PROOF_HASH_1, VERIFIED_AT_1);
        
        vm.prank(NON_OWNER);
        vm.expectRevert(abi.encodeWithSelector(CrossChainResolver.NotNodeOwner.selector, TEST_NODE, NON_OWNER));
        
        resolver.removeVerifiedAddress(TEST_NODE, BITCOIN_CHAIN);
    }
    
    /**
     * @dev Test removing non-existent verified address (should fail)
     */
    function testRemoveNonExistentVerifiedAddress() public {
        vm.prank(NODE_OWNER);
        vm.expectRevert(abi.encodeWithSelector(CrossChainResolver.VerifiedAddressNotFound.selector, TEST_NODE, BITCOIN_CHAIN));
        
        resolver.removeVerifiedAddress(TEST_NODE, BITCOIN_CHAIN);
    }
    
    /**
     * @dev Test removing verified address from middle of list
     */
    function testRemoveVerifiedAddressFromMiddle() public {
        vm.startPrank(NODE_OWNER);
        
        // Set three addresses
        resolver.setVerifiedAddress(TEST_NODE, BITCOIN_CHAIN, BITCOIN_ADDR, PROOF_HASH_1, VERIFIED_AT_1);
        resolver.setVerifiedAddress(TEST_NODE, SOLANA_CHAIN, SOLANA_ADDR, PROOF_HASH_2, VERIFIED_AT_2);
        resolver.setVerifiedAddress(TEST_NODE, ETHEREUM_CHAIN, ETHEREUM_ADDR, PROOF_HASH_3, VERIFIED_AT_3);
        
        // Remove the middle one (Solana)
        resolver.removeVerifiedAddress(TEST_NODE, SOLANA_CHAIN);
        
        vm.stopPrank();
        
        // Verify Solana was removed
        assertFalse(resolver.hasVerifiedAddressForChain(TEST_NODE, SOLANA_CHAIN));
        
        // Verify Bitcoin and Ethereum still exist
        assertTrue(resolver.hasVerifiedAddressForChain(TEST_NODE, BITCOIN_CHAIN));
        assertTrue(resolver.hasVerifiedAddressForChain(TEST_NODE, ETHEREUM_CHAIN));
        
        // Verify count
        assertEq(resolver.getVerifiedAddressCount(TEST_NODE), 2);
        
        // Verify chain IDs list
        string[] memory chainIds = resolver.getNodeChainIds(TEST_NODE);
        assertEq(chainIds.length, 2);
    }
    
    /**
     * @dev Test gas usage for setting verified address
     */
    function testGasUsage() public {
        vm.prank(NODE_OWNER);
        
        uint256 gasStart = gasleft();
        resolver.setVerifiedAddress(TEST_NODE, BITCOIN_CHAIN, BITCOIN_ADDR, PROOF_HASH_1, VERIFIED_AT_1);
        uint256 gasUsed = gasStart - gasleft();
        
        console.log("Gas used for setVerifiedAddress:", gasUsed);
        
        // Gas usage should be reasonable (less than 250k gas)
        assertLt(gasUsed, 250000);
    }
    
    /**
     * @dev Test edge case with very long addresses
     */
    function testLongAddress() public {
        string memory longAddr = "this_is_a_very_long_address_that_might_cause_issues_with_gas_usage_and_storage_but_should_still_work_correctly";
        
        vm.prank(NODE_OWNER);
        resolver.setVerifiedAddress(TEST_NODE, BITCOIN_CHAIN, longAddr, PROOF_HASH_1, VERIFIED_AT_1);
        
        (string memory addr, , ) = resolver.getVerifiedAddress(TEST_NODE, BITCOIN_CHAIN);
        assertEq(addr, longAddr);
    }
    
    /**
     * @dev Test edge case with very long chain IDs
     */
    function testLongChainId() public {
        string memory longChainId = "this_is_a_very_long_chain_id_that_might_cause_issues_with_gas_usage_and_storage_but_should_still_work_correctly";
        
        vm.prank(NODE_OWNER);
        resolver.setVerifiedAddress(TEST_NODE, longChainId, BITCOIN_ADDR, PROOF_HASH_1, VERIFIED_AT_1);
        
        assertTrue(resolver.hasVerifiedAddressForChain(TEST_NODE, longChainId));
    }
}

/**
 * @title MockENSRegistry
 * @dev Mock ENS Registry for testing purposes
 */
contract MockENSRegistry is IENSRegistry {
    mapping(bytes32 => address) private owners;
    mapping(bytes32 => address) private resolvers;
    mapping(bytes32 => uint64) private ttls;
    
    function setOwner(bytes32 node, address owner) external {
        owners[node] = owner;
    }
    
    function owner(bytes32 node) external view override returns (address) {
        return owners[node];
    }
    
    function resolver(bytes32 node) external view override returns (address) {
        return resolvers[node];
    }
    
    function setResolver(bytes32 node, address resolver) external override {
        resolvers[node] = resolver;
    }
    
    function ttl(bytes32 node) external view override returns (uint64) {
        return ttls[node];
    }
    
    function setTTL(bytes32 node, uint64 ttl) external override {
        ttls[node] = ttl;
    }
    
    function record(bytes32 node) external view override returns (address, address, uint64) {
        return (owners[node], resolvers[node], ttls[node]);
    }
}

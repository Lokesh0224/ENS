// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./lib/ens/IENSRegistry.sol";

/**
 * @title CrossChainResolver
 * @dev ENS-compatible resolver for cross-chain identity verification
 * @notice This contract allows ENS name owners to bind verified addresses from different blockchains
 * @author Cross-Chain Identity Hub
 */
contract CrossChainResolver {
    // ============ Structs ============
    
    /**
     * @dev Struct to store verified address information
     * @param addr The verified address on the specified chain
     * @param proofHash The hash of the verification proof
     * @param verifiedAt Timestamp when the address was verified
     */
    struct VerifiedAddress {
        string addr;
        bytes32 proofHash;
        uint256 verifiedAt;
    }

    // ============ State Variables ============
    
    /// @dev ENS Registry contract address
    IENSRegistry public immutable ensRegistry;
    
    /// @dev Mapping from node to chainId to VerifiedAddress
    /// @notice node => chainId => VerifiedAddress
    mapping(bytes32 => mapping(string => VerifiedAddress)) public verifiedAddresses;
    
    /// @dev Mapping to track if an address has been set for a node/chain combination
    mapping(bytes32 => mapping(string => bool)) public hasVerifiedAddress;
    
    /// @dev Array to store all chain IDs for a node (for enumeration)
    mapping(bytes32 => string[]) public nodeChainIds;
    
    /// @dev Mapping to track chain ID index in the array
    mapping(bytes32 => mapping(string => uint256)) public chainIdIndex;

    // ============ Events ============
    
    /**
     * @dev Emitted when a verified address is set
     * @param node The ENS node
     * @param chainId The blockchain chain ID
     * @param addr The verified address
     * @param proofHash The proof hash
     * @param verifiedAt The verification timestamp
     */
    event VerifiedAddressSet(
        bytes32 indexed node,
        string indexed chainId,
        string addr,
        bytes32 proofHash,
        uint256 verifiedAt
    );
    
    /**
     * @dev Emitted when a verified address is removed
     * @param node The ENS node
     * @param chainId The blockchain chain ID
     */
    event VerifiedAddressRemoved(
        bytes32 indexed node,
        string indexed chainId
    );

    // ============ Errors ============
    
    /// @dev Thrown when caller is not the owner of the ENS node
    error NotNodeOwner(bytes32 node, address caller);
    
    /// @dev Thrown when trying to set an empty address
    error EmptyAddress();
    
    /// @dev Thrown when trying to set an empty chain ID
    error EmptyChainId();
    
    /// @dev Thrown when trying to query a non-existent verified address
    error VerifiedAddressNotFound(bytes32 node, string chainId);

    // ============ Constructor ============
    
    /**
     * @dev Constructor sets the ENS Registry address
     * @param _ensRegistry The address of the ENS Registry contract
     */
    constructor(address _ensRegistry) {
        require(_ensRegistry != address(0), "Invalid ENS Registry address");
        ensRegistry = IENSRegistry(_ensRegistry);
    }

    // ============ Modifiers ============
    
    /**
     * @dev Modifier to ensure only the ENS node owner can call the function
     * @param node The ENS node to check ownership for
     */
    modifier onlyNodeOwner(bytes32 node) {
        address nodeOwner = ensRegistry.owner(node);
        if (nodeOwner != msg.sender) {
            revert NotNodeOwner(node, msg.sender);
        }
        _;
    }

    // ============ External Functions ============
    
    /**
     * @dev Sets a verified address for a specific chain
     * @notice Only the ENS name owner can call this function
     * @param node The ENS node
     * @param chainId The blockchain chain ID (e.g., "bitcoin", "solana", "ethereum")
     * @param addr The verified address on the specified chain
     * @param proofHash The hash of the verification proof from the backend
     * @param verifiedAt The timestamp when the address was verified
     */
    function setVerifiedAddress(
        bytes32 node,
        string calldata chainId,
        string calldata addr,
        bytes32 proofHash,
        uint256 verifiedAt
    ) external onlyNodeOwner(node) {
        // Validate inputs
        if (bytes(addr).length == 0) {
            revert EmptyAddress();
        }
        if (bytes(chainId).length == 0) {
            revert EmptyChainId();
        }
        
        // Check if this is a new chain ID for this node
        bool isNewChain = !hasVerifiedAddress[node][chainId];
        if (isNewChain) {
            // Add chain ID to the node's chain list
            nodeChainIds[node].push(chainId);
            chainIdIndex[node][chainId] = nodeChainIds[node].length - 1;
        }
        
        // Set the verified address
        verifiedAddresses[node][chainId] = VerifiedAddress({
            addr: addr,
            proofHash: proofHash,
            verifiedAt: verifiedAt
        });
        
        hasVerifiedAddress[node][chainId] = true;
        
        emit VerifiedAddressSet(node, chainId, addr, proofHash, verifiedAt);
    }
    
    /**
     * @dev Gets a verified address for a specific chain
     * @param node The ENS node
     * @param chainId The blockchain chain ID
     * @return addr The verified address
     * @return proofHash The proof hash
     * @return verifiedAt The verification timestamp
     */
    function getVerifiedAddress(
        bytes32 node,
        string calldata chainId
    ) external view returns (string memory addr, bytes32 proofHash, uint256 verifiedAt) {
        if (!hasVerifiedAddress[node][chainId]) {
            revert VerifiedAddressNotFound(node, chainId);
        }
        
        VerifiedAddress memory verified = verifiedAddresses[node][chainId];
        return (verified.addr, verified.proofHash, verified.verifiedAt);
    }
    
    /**
     * @dev Removes a verified address for a specific chain
     * @notice Only the ENS name owner can call this function
     * @param node The ENS node
     * @param chainId The blockchain chain ID
     */
    function removeVerifiedAddress(
        bytes32 node,
        string calldata chainId
    ) external onlyNodeOwner(node) {
        if (!hasVerifiedAddress[node][chainId]) {
            revert VerifiedAddressNotFound(node, chainId);
        }
        
        // Remove from mapping
        delete verifiedAddresses[node][chainId];
        hasVerifiedAddress[node][chainId] = false;
        
        // Remove from chain ID list
        uint256 index = chainIdIndex[node][chainId];
        uint256 lastIndex = nodeChainIds[node].length - 1;
        
        if (index != lastIndex) {
            // Move last element to the deleted position
            string memory lastChainId = nodeChainIds[node][lastIndex];
            nodeChainIds[node][index] = lastChainId;
            chainIdIndex[node][lastChainId] = index;
        }
        
        // Remove last element
        nodeChainIds[node].pop();
        delete chainIdIndex[node][chainId];
        
        emit VerifiedAddressRemoved(node, chainId);
    }
    
    /**
     * @dev Gets all chain IDs for a node
     * @param node The ENS node
     * @return chainIds Array of chain IDs
     */
    function getNodeChainIds(bytes32 node) external view returns (string[] memory chainIds) {
        return nodeChainIds[node];
    }
    
    /**
     * @dev Gets the number of verified addresses for a node
     * @param node The ENS node
     * @return count The number of verified addresses
     */
    function getVerifiedAddressCount(bytes32 node) external view returns (uint256 count) {
        return nodeChainIds[node].length;
    }
    
    /**
     * @dev Checks if a verified address exists for a node and chain
     * @param node The ENS node
     * @param chainId The blockchain chain ID
     * @return exists True if verified address exists
     */
    function hasVerifiedAddressForChain(bytes32 node, string calldata chainId) external view returns (bool exists) {
        return hasVerifiedAddress[node][chainId];
    }

    // ============ View Functions ============
    
    /**
     * @dev Gets the ENS Registry address
     * @return registry The ENS Registry contract address
     */
    function getENSRegistry() external view returns (address registry) {
        return address(ensRegistry);
    }
    
    /**
     * @dev Gets the owner of a node
     * @param node The ENS node
     * @return owner The owner address
     */
    function getNodeOwner(bytes32 node) external view returns (address owner) {
        return ensRegistry.owner(node);
    }
}

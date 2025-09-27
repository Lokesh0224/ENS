// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./lib/ens/IENSRegistry.sol";

contract CrossChainResolver {

    struct VerifiedAddress {
        string addr;
        bytes32 proofHash;
        uint256 verifiedAt;
    }

    IENSRegistry public immutable ensRegistry;
    
    mapping(bytes32 => mapping(string => VerifiedAddress)) public verifiedAddresses;
    
    mapping(bytes32 => mapping(string => bool)) public hasVerifiedAddress;
    
    mapping(bytes32 => string[]) public nodeChainIds;
    
    mapping(bytes32 => mapping(string => uint256)) public chainIdIndex;

  
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

    // ============ Errors ============
    
    error NotNodeOwner(bytes32 node, address caller);
    
    error EmptyAddress();
    
    error EmptyChainId();
    
    error VerifiedAddressNotFound(bytes32 node, string chainId);


    constructor(address _ensRegistry) {
        require(_ensRegistry != address(0), "Invalid ENS Registry address");
        ensRegistry = IENSRegistry(_ensRegistry);
    }

    modifier onlyNodeOwner(bytes32 node) {
        address nodeOwner = ensRegistry.owner(node);
        if (nodeOwner != msg.sender) {
            revert NotNodeOwner(node, msg.sender);
        }
        _;
    }


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

    function getNodeChainIds(bytes32 node) external view returns (string[] memory chainIds) {
        return nodeChainIds[node];
    }
  
    function getVerifiedAddressCount(bytes32 node) external view returns (uint256 count) {
        return nodeChainIds[node].length;
    }
    

    function hasVerifiedAddressForChain(bytes32 node, string calldata chainId) external view returns (bool exists) {
        return hasVerifiedAddress[node][chainId];
    }


    function getENSRegistry() external view returns (address registry) {
        return address(ensRegistry);
    }
    
  
    function getNodeOwner(bytes32 node) external view returns (address owner) {
        return ensRegistry.owner(node);
    }
}

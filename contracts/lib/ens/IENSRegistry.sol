// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IENSRegistry
 * @dev Interface for ENS Registry contract
 * @notice This interface defines the core ENS registry functions needed for ownership verification
 */
interface IENSRegistry {
    /**
     * @dev Returns the owner of a node
     * @param node The node to query
     * @return The address of the owner
     */
    function owner(bytes32 node) external view returns (address);

    /**
     * @dev Returns the resolver of a node
     * @param node The node to query
     * @return The address of the resolver
     */
    function resolver(bytes32 node) external view returns (address);

    /**
     * @dev Sets the resolver for a node
     * @param node The node to set the resolver for
     * @param resolver The address of the resolver
     */
    function setResolver(bytes32 node, address resolver) external;

    /**
     * @dev Returns the TTL of a node
     * @param node The node to query
     * @return The TTL of the node
     */
    function ttl(bytes32 node) external view returns (uint64);

    /**
     * @dev Sets the TTL for a node
     * @param node The node to set the TTL for
     * @param ttl The TTL to set
     */
    function setTTL(bytes32 node, uint64 ttl) external;

    /**
     * @dev Returns the record for a node
     * @param node The node to query
     * @return owner The owner of the node
     * @return resolver The resolver of the node
     * @return ttl The TTL of the node
     */
    function record(bytes32 node) external view returns (address owner, address resolver, uint64 ttl);
}

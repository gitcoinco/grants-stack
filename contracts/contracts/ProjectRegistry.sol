// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";


/**
 * @title ProjectRegistry
 * @notice todo
 * @dev todo
 */
contract ProjectRegistry {
    // Types

    // The pointer to the external metadadata composed by protocol and pointer
    struct MetaPtr {
        uint256 protocol;
        string pointer;
    }


    // The project structs contains the minimal data we need for a project
    struct Project {
        uint96 id;
        address recipient;
        MetaPtr metadata;
    }

    // A linked list of owners of a project
    // The use of a linked list allows us to easily add and remove owners,
    // access them directly in O(1), and loop through them.
    //
    // {
    //     count: 3,
    //     list: {
    //         OWNERS_LIST_SENTINEL => owner1Address,
    //         owner1Address => owner2Address,
    //         owner2Address => owner3Address,
    //         owner3Address => OWNERS_LIST_SENTINEL
    //     }
    // }
    struct OwnersList {
        uint256 count;
        mapping(address => address) list;
    }

    // State variables

    // Used as sentinel value in the owners linked list.
    address OWNERS_LIST_SENTINEL = address(0x1);

    // The number of projects created, used to give an incremental id to each one
    uint96 public projectsCount;

    // The mapping of projects, from projectID to Project
    mapping(uint96 => Project) public projects;

    // The mapping projects owners, from projectID to OwnersList
    mapping(uint96 => OwnersList) public projectsOwners;

    // Events

    event ProjectCreated(address indexed owner, uint96 projectID);
    event MetaDataUpdated(address indexed owner, uint96 projectID);

    // Modifiers
    // ...

    constructor() {}

    // External functions

    /**
     * @notice todo
     * @dev todo
     */
    function createProject(address recipient, MetaPtr memory metadata) external {
        uint96 projectID = projectsCount++;

        Project storage g = projects[projectID];
        g.id = projectID;
        g.recipient = recipient;
        g.metadata = metadata;

        initProjectOwners(projectID);

        emit ProjectCreated(msg.sender, projectID);
    }

    // Public functions

    /**
     * @notice todo
     * @dev todo
     */
    function getOwners(uint96 projectID) public view returns(address[] memory) {
        OwnersList storage owners = projectsOwners[projectID];

        address[] memory list = new address[](owners.count);

        uint256 index = 0;
        address current = owners.list[OWNERS_LIST_SENTINEL];

        if (current == address(0x0)) {
            return list;
        }

        while (current != OWNERS_LIST_SENTINEL) {
            list[index] = current;
            current = owners.list[current];
        }

        return list;
    }

    // Internal functions

    /**
     * @notice todo
     * @dev todo
     */
    function initProjectOwners(uint96 projectID) internal {
        OwnersList storage owners = projectsOwners[projectID];

        owners.list[OWNERS_LIST_SENTINEL] = msg.sender;
        owners.list[msg.sender] = OWNERS_LIST_SENTINEL;
        owners.count = 1;
    }

    // Private functions
    // ...
}

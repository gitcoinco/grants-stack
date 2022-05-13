//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract GrantsRegistry {
    struct Grant {
        uint96 id;
        address recipient;
        address owner;
        string metadata;
    }

    Grant[] public grants;

    constructor() {}

    event GrantCreated(address indexed owner, uint96 indexed grantId);
    event GrantUpdated(address indexed owner, uint96 indexed grantId);

    function createGrant(
        address owner,
        string memory metadata,
        address recipient
    ) public {
        uint96 grantId = uint96(grants.length);
        grants.push(
            Grant({
                id: grantId,
                recipient: recipient,
                owner: owner,
                metadata: metadata
            })
        );

        emit GrantCreated(owner, grantId);
    }

    function updateGrant(uint96 id, string memory metadata) public {
        Grant memory grant = grants[id];
        require(msg.sender == grant.owner, "You are not the owner");
        grant.metadata = metadata;
        grants[id] = grant;
        emit GrantUpdated(grant.owner, id);
    }

    function grantsLength() public view returns (uint256) {
        return grants.length;
    }

    function grantMetaData(uint96 id) public view returns (string memory) {
        return grants[id].metadata;
    }
}

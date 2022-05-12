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

    event GrantCreated(
        uint96 indexed grantId,
        address indexed owner,
        string indexed metadata
    );
    event GrantUpdated(
        uint96 indexed grantId,
        address indexed owner,
        string indexed metadata
    );

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
        emit GrantCreated(grantId, owner, metadata);
    }

    function updateGrant(uint96 id, string memory metadata) public {
        Grant memory grant = grants[id];
        require(msg.sender == grant.owner, "You are not the owner");
        grant.metadata = metadata;
        grants[id] = grant;
        emit GrantUpdated(id, grant.owner, grant.metadata);
    }

    function grantsLength() public view returns (uint256) {
        return grants.length;
    }
}

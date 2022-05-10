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

  function createGrant(address owner, string memory metadata, address recipient) public {
    grants.push(Grant({
      id: uint96(grants.length),
      recipient: recipient,
      owner: owner,
      metadata: metadata
    }));
  }

  function grantsLength() public view returns(uint256) {
    return grants.length;
  }
}

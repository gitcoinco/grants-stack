// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

contract GrantNFT is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() ERC721("GrantNFT", "Grant") {}

  function mintGrant(address recipient, string memory tokenURI) public returns (uint256 newTokenId) {
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();
    _mint(recipient, newItemId);
    _setTokenURI(newItemId, tokenURI);

    return newItemId;
  }

  function updateGrant(uint256 tokenId, string memory newURI) public {
    address owner = ownerOf(tokenId);
    console.log(owner, "Ownerrr");
    require(msg.sender == owner, "You are not the owner");
  }
}
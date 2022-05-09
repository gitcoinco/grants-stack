// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
This is a Proof of Concept outlining a possible structure of creating grants represented as NFTs. Not the final contract in anyway :)
*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

contract GrantNFT is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() ERC721("GrantNFT", "Grant") {}

  event GrantCreated(uint256 grantId, address owner, string tokenURI);
  event GrantUpdated(uint256 grantId, address owner, string tokenURI);

  /*
   * @notice Create a new grant
   * @param recipient Grant owner
   * @param tokenURI IPFS hash that contains grant meta data
   */
  function mintGrant(address recipient, string memory tokenURI) public returns (uint256 newTokenId) {
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();
    _mint(recipient, newItemId);
    _setTokenURI(newItemId, tokenURI);
    emit GrantCreated(newItemId, recipient, tokenURI);
    return newItemId;
  }

  /*
   * @notice edit a grant
   * @param tokenId id of grant
   * @param newURI IPFS hash that contains updated grant meta data
   */
  function updateGrant(uint256 tokenId, string memory newURI) public {
    address owner = ownerOf(tokenId);
    require(msg.sender == owner, "You are not the owner");
    _setTokenURI(tokenId, newURI);
    emit GrantUpdated(tokenId, owner, newURI);
  }
}

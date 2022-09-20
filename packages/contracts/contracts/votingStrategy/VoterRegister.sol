// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Voter Badge contract
 * @notice Badge contract is a minimalist soulbound ERC-721 implementation
 * @author GITCOIN
 */
contract VoterRegister is ERC721, Ownable {

    /**
     * @notice BaseURI of the NFT
     */
    string public baseURI;

    /**
     * @notice Total supply of the NFT
     */
    uint256 public totalSupply;

    /**
     * @param _name Name of the NFT
     * @param _symbol Symbol of the NFT
     * @param _baseURI BaseURI of the NFT
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) payable ERC721(_name, _symbol) {
        baseURI = _baseURI;
    }

    /**
     * @notice Mints the soulbound badge NFT.
     * @notice Only Admin contract i.e BadgeAdmin contract can mint the badge.
     *
     * @param _citizen Address of the citizen
     */
    function mint(address _citizen) external onlyOwner {
        _mint(_citizen, totalSupply++);
    }

    /**
     * @notice Burns the soulbound badge NFT.
     *
     * @param _id The token ID of the NFT
     */
    function burn(uint256 _id) external onlyOwner {
        _burn(_id);
    }

    /**
     * @notice Withdraw the contract ETH balance
     */
    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    /**
     * @notice Returns the the tokenURI for given NFT token ID.
     *
     * @param _id The token ID of the NFT
     */
    function tokenURI(uint256 _id) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, _id));
    }

    /**
     * @notice Make the Badge Soul Bound
     * @notice Override the ERC721 transferFrom method to revert
     */
    function transferFrom(
        address,
        address,
        uint256
    ) public pure override {
        revert("SOULBOUND");
    }

    /**
     * @notice Override the ERC721 Approve method to revert
     */
    function approve(address, uint256) public pure override {
        revert("SOULBOUND");
    }

    /**
     * @notice Override the ERC721 setApprovalForAll method to revert
     */
    function setApprovalForAll(address, bool) public pure override {
        revert("SOULBOUND");
    }

    /**
     * @notice ERC165 interface check function
     *
     * @param _interfaceId Interface ID to check
     *
     * @return Whether or not the interface is supported by this contract
     */
    function supportsInterface(bytes4 _interfaceId) public pure override returns (bool) {
        bytes4 iface1 = type(IERC165).interfaceId;
        return _interfaceId == iface1;
    }
}

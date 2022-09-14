// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./IVotingStrategy.sol";

contract QuadraticVotingStrategy is IVotingStrategy, ReentrancyGuard {
    using Math for uint256;

    uint256 public immutable VOTE_CREDITS;

    address public voterBadge;
    address[] public voters;
    address[] public grantee;

    mapping(address => bool) public voterAdded;
    mapping(address => uint256) public voteCreditsUsed;
    mapping(address => bool) public granteeAdded;
    mapping(address => uint256) public totalVoteCount; // Total votes received by a grantee
    
    constructor(uint256 _voteCredits, address _voterBadge){
        VOTE_CREDITS = _voteCredits;
        voterBadge = _voterBadge;
    }

    function vote(bytes[] calldata encodedVotes, address voterAddress)
        external
        override
        nonReentrant
    {
        require(IERC721(voterBadge).balanceOf(voterAddress) > 0, "QuadraticVotingStrategy: Invalid voter");
        require(voteCreditsUsed[voterAddress] < VOTE_CREDITS, "QuadraticVotingStrategy: No vote credits left");
        for (uint256 i = 0; i < encodedVotes.length; i++) {
            (address granteeAddress, uint256 voteCredits) = abi.decode(
                encodedVotes[i],
                (address, uint256)
            );
            require((voteCreditsUsed[voterAddress] + voteCredits) < VOTE_CREDITS, "QuadraticVotingStrategy: No vote credits left");
            uint256 votes = voteCredits.sqrt();
            voteCreditsUsed[voterAddress] +=  voteCredits;
            totalVoteCount[granteeAddress] += votes;
            if (!voterAdded[voterAddress]) {
                voters.push(voterAddress);
                voterAdded[voterAddress] = true;
            }
            if (!granteeAdded[granteeAddress]) {
                grantee.push(granteeAddress);
                granteeAdded[voterAddress] = true;
            }
        }
    }
}

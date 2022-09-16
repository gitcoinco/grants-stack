// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "../utils/Math.sol";
import "./IVotingStrategy.sol";

/**
 * @notice Contract deployed per Round which would be managed by
 * a group of ROUND_OPERATOR
 *
 */
contract QVImplementation is IVotingStrategy, AccessControlEnumerable, Initializable {
  using Address for address;

  // --- Roles ---

  /// @notice round operator role
  bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");

  // --- Events ---

  /// @notice Emitted when the voter badge is updated
  event VoterBadgeUpdated(address indexed oldVoterBadge, address indexed newVoterBadge);

  /// @notice Emited when a voter votes for a grantee
  event Voted(address indexed voterAddress, address indexed granteeAddress, uint256 indexed voteCredits, uint256 votes);

  uint256 public VOTE_CREDITS;

  address public voterBadge;
  address[] public voters;
  address[] public grantee;

  mapping(address => bool) public voterAdded;
  mapping(address => uint256) public voteCreditsUsed;
  mapping(address => bool) public granteeAdded;
  mapping(address => uint256) public totalVoteCount; // Total votes received by a grantee
  
  /**
   * @notice Instantiates a new QV contract
   * @param encodedParameters Encoded parameters for program creation
   * @dev encodedParameters
   *  - _voteCredits Vote credits allocated to each voter
   *  - _voterBadge Voter badge address
   *  - _adminRoles Addresses to be granted DEFAULT_ADMIN_ROLE
   *  - _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE
   */
  function initialize(
    bytes calldata encodedParameters
  ) external initializer {
    // Decode _encodedParameters
    (
      uint256 _voteCredits, 
      address _voterBadge,
      address[] memory _adminRoles,
      address[] memory _roundOperators
    ) = abi.decode(
      encodedParameters, (
      uint256,
      address,
      address[],
      address[]
    ));

    VOTE_CREDITS = _voteCredits;
    voterBadge = _voterBadge;

    // Assigning default admin role
    for (uint256 i = 0; i < _adminRoles.length; ++i) {
      _grantRole(DEFAULT_ADMIN_ROLE, _adminRoles[i]);
    }

    // Assigning round operators
    for (uint256 i = 0; i < _roundOperators.length; ++i) {
      _grantRole(ROUND_OPERATOR_ROLE, _roundOperators[i]);
    }
  }

  // @notice Update voter badge (only by ROUND_OPERATOR_ROLE)
  /// @param newVoterBadge New voter badge
  function updateVoterBadge(address newVoterBadge) external onlyRole(ROUND_OPERATOR_ROLE) {
    emit VoterBadgeUpdated(voterBadge, newVoterBadge);
    voterBadge = newVoterBadge;
  }

  /**
   * @notice Invoked by RoundImplementation which allows
   * a voter to cast votes to multiple grants during a round
   *
   * @dev
   * - this would be triggered when a voter casts their vote via round explorer
   *
   * @param encodedVotes encoded list of votes
   * @param voterAddress voter address
   */
  function vote(bytes[] calldata encodedVotes, address voterAddress)
    external
    override
  {
    require(IERC721(voterBadge).balanceOf(voterAddress) > 0, "QuadraticVotingStrategy: Invalid voter");
    require(voteCreditsUsed[voterAddress] < VOTE_CREDITS, "QuadraticVotingStrategy: No vote credits left");
    for (uint256 i = 0; i < encodedVotes.length; i++) {
      (address granteeAddress, uint256 voteCredits) = abi.decode(
        encodedVotes[i],
        (address, uint256)
      );
      require((voteCreditsUsed[voterAddress] + voteCredits) < VOTE_CREDITS, "QuadraticVotingStrategy: No vote credits left");
      uint256 votes = Math.sqrt(voteCredits);
      voteCreditsUsed[voterAddress] +=  voteCredits;
      totalVoteCount[granteeAddress] += votes;
      emit Voted(voterAddress, granteeAddress, voteCredits, votes);
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

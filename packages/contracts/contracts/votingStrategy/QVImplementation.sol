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
contract QVImplementation is
    IVotingStrategy,
    AccessControlEnumerable,
    Initializable
{
    using Address for address;

    /**
     * @notice Set data structure.
     */
    struct Set {
        bytes32[] ids;
        mapping(bytes32 => bool) is_in;
    }

    /**
     * @notice Tally structure.
     * @param voteCredits
     * @param votes
     */
    struct Tally {
        uint256 voteCredits;
        uint256 votes;
    }

    /**
     * @notice Emitted when the voter badge is updated
     */
    event VoterRegisterUpdated(
        address indexed oldVoterRegister,
        address indexed newVoterRegister
    );

    /**
     * @notice Emited when a voter votes for a grantee
     */
    event Voted(
        address indexed voterAddress,
        bytes32 indexed grantID,
        uint256 indexed voteCredits,
        uint256 votes
    );

    /**
     * @notice Emitted when the votes are tallied
     */
    event Tallied(bytes oldTally, bytes indexed currentTally);

    /**
     * @dev Round operator role
     */
    bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");

    /**
     * @notice The voters initial vote credit amount
     */
    uint256 public VOTE_CREDITS;

    /**
     * @notice The voter register contract
     */
    address public voterRegister;

    /**
     * @notice Vote data storage
     */
    bytes[] public votesData;

    /**
     * @notice The tally count.
     */
    bytes public currentTally;

    /**
     * @notice Mapping of vote ID to vote data.
     */
    mapping(bytes32 => Tally) public tallies;

    /**
     * @notice Mapping of voter address to vote credits used.
     */
    mapping(address => uint256) public voteCreditsUsed;

    /**
     * @notice A unique set of the the tally
     */
    Set tallySet;

    /**
     * @notice Instantiates a new QV contract
     * @param encodedParameters Encoded parameters for program creation
     * @dev encodedParameters
     *  - _voteCredits Vote credits allocated to each voter
     *  - _voterBadge Voter badge address
     *  - _adminRoles Addresses to be granted DEFAULT_ADMIN_ROLE
     *  - _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE
     */
    function initialize(bytes calldata encodedParameters) external initializer {
        // Decode _encodedParameters
        (
            uint256 _voteCredits,
            address _voterRegister,
            address[] memory _adminRoles,
            address[] memory _roundOperators
        ) = abi.decode(
                encodedParameters,
                (uint256, address, address[], address[])
            );

        VOTE_CREDITS = _voteCredits;
        voterRegister = _voterRegister;

        // Assigning default admin role
        for (uint256 i = 0; i < _adminRoles.length; ++i) {
            _grantRole(DEFAULT_ADMIN_ROLE, _adminRoles[i]);
        }

        // Assigning round operators
        for (uint256 i = 0; i < _roundOperators.length; ++i) {
            _grantRole(ROUND_OPERATOR_ROLE, _roundOperators[i]);
        }
    }

    /**
     * @notice Update voter badge (only by ROUND_OPERATOR_ROLE)
     * @param newVoterRegister New voter badge
     */
    function updateVoterRegister(address newVoterRegister)
        external
        onlyRole(ROUND_OPERATOR_ROLE)
    {
        emit VoterRegisterUpdated(voterRegister, newVoterRegister);
        voterRegister = newVoterRegister;
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
        require(
            IERC721(voterRegister).balanceOf(voterAddress) > 0,
            "NOT_REGISTERED"
        );
        require(
            voteCreditsUsed[voterAddress] < VOTE_CREDITS,
            "INSUFFICIENT_CREDITS"
        );
        for (uint256 i = 0; i < encodedVotes.length; i++) {
            (bytes32 grantID, uint256 voteCredits) = abi.decode(
                encodedVotes[i],
                (bytes32, uint256)
            );
            require(
                (voteCreditsUsed[voterAddress] + voteCredits) < VOTE_CREDITS,
                "INSUFFICIENT_CREDITS"
            );
            uint256 votes = Math.sqrt(voteCredits);
            voteCreditsUsed[voterAddress] += voteCredits;
            votesData.push(
                abi.encode(voterAddress, grantID, voteCredits, votes)
            );
            emit Voted(voterAddress, grantID, voteCredits, votes);
        }
    }

    /**
     * @notice Tally the votes.
     * @dev This function will calculate and store the a tally of the votes.
     * This can be called at any time by anyone.
     */
    function tally() external {
        // For every vote, decode the vote data, add the vote voteCredits and votes to IDs vote data
        for (uint256 i = 0; i < votesData.length; i++) {
            (, bytes32 grantID, uint256 voteCredits, uint256 votes) = abi
                .decode(votesData[i], (address, bytes32, uint256, uint256));
            // If the ID is not in the set, it has not been voted for yet. Add it to the set storage and continue for future votes.
            if (!tallySet.is_in[grantID]) {
                tallySet.ids.push(grantID);
                tallySet.is_in[grantID] = true;
            }
            tallies[grantID].voteCredits += voteCredits;
            tallies[grantID].votes += votes;
        }

        bytes32[] memory ids = new bytes32[](tallySet.ids.length);
        uint256[] memory totalVoteCredits = new uint256[](tallySet.ids.length);
        uint256[] memory totalVotes = new uint256[](tallySet.ids.length);

        for (uint256 j = 0; j < tallySet.ids.length; j++) {
            ids[j] = tallySet.ids[j];
            totalVoteCredits[j] = tallies[tallySet.ids[j]].voteCredits;
            totalVotes[j] = tallies[tallySet.ids[j]].votes;
        }

        bytes memory newTally = abi.encode(ids, totalVoteCredits, totalVotes);
        emit Tallied(currentTally, newTally);
        currentTally = newTally;
    }
}

// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "./GrantRoundImplementation.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./utils/MetaPtr.sol";

/**
 * @notice Invoked by GrantOperator to enable creation of a
 * grant round by cloning the GrantRoundImplementation contract.
 * The factory contract emits an event anytime a round is created
 * which can be used to derive the round registry.
 *
 * @dev GrantRoundFactory is deployed once per chain and stores
 * a reference to the deployed GrantRoundImplementation.
 * @dev GrantRoundFactory uses openzeppelin Clones to reduce deploy
 * costs and also allows uprgrading grantRoundContract
 * @dev This contract is Ownable thus supports ownership transfership
 *
 */
contract GrantRoundFactory is Ownable {

  address public grantRoundContract;

  // --- Event ---

  /// @notice Emitted when a GrantRound contract is updated
  event GrantRoundContractUpdated(address grantRoundAddress);

  /// @notice Emitted when a new GrantRound is created
  event GrantRoundCreated(address indexed grantRoundAddress, address indexed ownedBy);


  // --- Core methods ---

  /**
   * @notice Allows the owner to update the GrantRoundImplementation.
   * This provides us the flexibility to upgrade GrantRoundImplementation
   * contract while relying on the same GrantRoundFactory to get the list of
   * grant rounds.
   */
  function updateGrantRoundContract(address _grantRoundContract) public onlyOwner {
    grantRoundContract = _grantRoundContract;

    emit GrantRoundContractUpdated(_grantRoundContract);
  }

  /**
   * @notice Clones GrantRoundImp a new grant round and emits event
   *
   * @param _votingContract Voting Contract
   * @param _grantApplicationsStartTime Unix timestamp from when grants can apply
   * @param _roundStartTime Unix timestamp of the start of the round
   * @param _roundEndTime Unix timestamp of the end of the round
   * @param _token Address of the ERC20 token for accepting matching pool contributions
    * @param _ownedBy Program which created the contract
   * @param _metaPtr URL pointing to the grant round metadata
   * @param _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE
   */
  function create(
    IVote _votingContract,
    uint256 _grantApplicationsStartTime,
    uint256 _roundStartTime,
    uint256 _roundEndTime,
    IERC20 _token,
    address _ownedBy,
    MetaPtr calldata _metaPtr,
    address[] calldata _roundOperators
  ) external returns (address) {

    address _clone = Clones.clone(grantRoundContract);

    GrantRoundImplementation(_clone).initialize(
      _votingContract,
      _grantApplicationsStartTime,
      _roundStartTime,
      _roundEndTime,
      _token,
      _metaPtr,
      msg.sender,
      _roundOperators
    );

    emit GrantRoundCreated(_clone, _ownedBy);

    return _clone;
  }

}
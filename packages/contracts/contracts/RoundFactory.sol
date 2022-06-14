// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "./RoundImplementation.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./utils/MetaPtr.sol";

/**
 * @notice Invoked by a RoundOperator to enable creation of a
 * round by cloning the RoundImplementation contract.
 * The factory contract emits an event anytime a round is created
 * which can be used to derive the round registry.
 *
 * @dev RoundFactory is deployed once per chain and stores
 * a reference to the deployed RoundImplementation.
 * @dev RoundFactory uses openzeppelin Clones to reduce deploy
 * costs and also allows uprgrading RoundContract
 * @dev This contract is Ownable thus supports ownership transfership
 *
 */
contract RoundFactory is Ownable {

  address public RoundContract;

  // --- Event ---

  /// @notice Emitted when a Round contract is updated
  event RoundContractUpdated(address roundAddress);

  /// @notice Emitted when a new Round is created
  event RoundCreated(address indexed roundAddress, address indexed ownedBy);


  // --- Core methods ---

  /**
   * @notice Allows the owner to update the RoundImplementation.
   * This provides us the flexibility to upgrade RoundImplementation
   * contract while relying on the same RoundFactory to get the list of
   * rounds.
   */
  function updateRoundContract(address _RoundContract) public onlyOwner {
    RoundContract = _RoundContract;

    emit RoundContractUpdated(_RoundContract);
  }

  /**
   * @notice Clones RoundImp a new round and emits event
   *
   * @param _votingStrategy Voting Strategy Contract
   * @param _applicationsStartTime Unix timestamp from when round can accept applications
   * @param _roundStartTime Unix timestamp of the start of the round
   * @param _roundEndTime Unix timestamp of the end of the round
   * @param _token Address of the ERC20 token for accepting matching pool contributions
   * @param _ownedBy Program which created the contract
   * @param _metaPtr URL pointing to the round metadata
   * @param _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE
   */
  function create(
    IVotingStrategy _votingStrategy,
    uint256 _applicationsStartTime,
    uint256 _roundStartTime,
    uint256 _roundEndTime,
    IERC20 _token,
    address _ownedBy,
    MetaPtr calldata _metaPtr,
    address[] calldata _roundOperators
  ) external returns (address) {

    address _clone = Clones.clone(RoundContract);

    RoundImplementation(_clone).initialize(
      _votingStrategy,
      _applicationsStartTime,
      _roundStartTime,
      _roundEndTime,
      _token,
      _metaPtr,
      msg.sender,
      _roundOperators
    );

    emit RoundCreated(_clone, _ownedBy);

    return _clone;
  }

}
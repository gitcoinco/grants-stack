// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "./dummyRoundImplementation.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "../../utils/MetaPtr.sol";


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
contract DummyRoundFactory is OwnableUpgradeable {

  address public roundContract;

  string public foobar;

  // --- Event ---

  /// @notice Emitted when a Round contract is updated
  event RoundContractUpdated(address roundAddress);

  /// @notice Emitted when a new Round is created
  event RoundCreated(address indexed roundAddress, address indexed ownedBy);


  /// @notice constructor function which ensure deployer is set as owner
  function initialize() external initializer {
    __Context_init_unchained();
    __Ownable_init_unchained();
  }

  // --- Core methods ---

  /**
   * @notice Allows the owner to update the RoundImplementation.
   * This provides us the flexibility to upgrade RoundImplementation
   * contract while relying on the same RoundFactory to get the list of
   * rounds.
   */
  function updateRoundContract(address newRoundContract) external onlyOwner {
    // slither-disable-next-line missing-zero-check
    roundContract = newRoundContract;

    emit RoundContractUpdated(newRoundContract);
  }

  /**
   * @notice Clones RoundImp a new round and emits event
   *
   * @param encodedParameters Encoded parameters for creating a round
   * @param ownedBy Program which created the contract
   */
  function create(
    bytes calldata encodedParameters,
    address ownedBy,
    string calldata newFoobar
  ) external returns (address) {

    foobar = newFoobar;
    address clone = ClonesUpgradeable.clone(roundContract);

    emit RoundCreated(clone, ownedBy);

    DummyRoundImplementation(clone).initialize(
      encodedParameters,
      newFoobar
    );

    return clone;
  }

}

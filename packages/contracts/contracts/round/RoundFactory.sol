// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "./RoundImplementation.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "../utils/MetaPtr.sol";

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
contract RoundFactory is OwnableUpgradeable {

  string public constant VERSION = "0.2.0";

  // --- Data ---

  /// @notice Address of the RoundImplementation contract
  address public roundContract;

  /// @notice Address of the protocol treasury
  address payable public protocolTreasury;

  /// @notice Protocol fee percentage
  uint8 public protocolFeePercentage;

  // --- Event ---

  /// @notice Emitted when protocol fee percentage is updated
  event ProtocolFeePercentageUpdated(uint8 protocolFeePercentage);

  /// @notice Emitted when a protocol wallet address is updated
  event ProtocolTreasuryUpdated(address protocolTreasuryAddress);

    /// @notice Emitted when a Round contract is updated
  event RoundContractUpdated(address roundAddress);

  /// @notice Emitted when a new Round is created
  event RoundCreated(address indexed roundAddress, address indexed ownedBy, address indexed roundImplementation);


  /// @notice constructor function which ensure deployer is set as owner
  function initialize() external initializer {
    __Context_init_unchained();
    __Ownable_init_unchained();
  }

  // --- Core methods ---

  /**
   * @notice Allows the owner to update the overall protocol fee percentage
   *
   * @param newProtocolFeePercentage New protocol fee percentage
   */
  function updateProtocolFeePercentage(uint8 newProtocolFeePercentage) public onlyOwner {

    protocolFeePercentage = newProtocolFeePercentage;

    emit ProtocolFeePercentageUpdated(protocolFeePercentage);
  }

  /**
   * @notice Allows the owner to update the protocol treasury.
   * This provides us the flexibility to update protocol treasury.
   *
   * @param newProtocolTreasury New protocol treasury address
   */
  function updateProtocolTreasury(address payable newProtocolTreasury) external onlyOwner {

    require(newProtocolTreasury != address(0), "protocolTreasury is 0x");   

    protocolTreasury = newProtocolTreasury;

    emit ProtocolTreasuryUpdated(protocolTreasury);
  }

  /**
   * @notice Allows the owner to update the RoundImplementation.
   * This provides us the flexibility to upgrade RoundImplementation
   * contract while relying on the same RoundFactory to get the list of
   * rounds.
   *
   * @param newRoundContract New RoundImplementation contract address
   */
  function updateRoundContract(address payable newRoundContract) external onlyOwner {

    require(newRoundContract != address(0), "roundContract is 0x");   

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
    address ownedBy
  ) external returns (address) {

    require(roundContract != address(0), "roundContract is 0x");
    require(protocolTreasury != address(0), "protocolTreasury is 0x");

    address clone = ClonesUpgradeable.clone(roundContract);

    emit RoundCreated(clone, ownedBy, payable(roundContract));

    RoundImplementation(payable(clone)).initialize(
      encodedParameters,
      address(this)
    );

    return clone;
  }

}

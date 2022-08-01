// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../../utils/MetaPtr.sol";


/**
 * @notice Program which would managed by a group of 
 * PROGRAM_OPERATOR deployed via the ProgramFactory
 */
contract DummyProgramImplementation is AccessControlEnumerable, Initializable {

  // --- Libraries ---
  using Address for address;

  // --- Roles ---

  /// @notice program operator role
  bytes32 public constant PROGRAM_OPERATOR_ROLE = keccak256("PROGRAM_OPERATOR");

  // --- Events ---

  /// @notice Emitted when a team metadata pointer is updated
  event MetadataUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  // --- Data ---

  string public foobar;

  /// @notice URL pointing for program metadata (for off-chain use)
  MetaPtr public metaPtr;


  // --- Core methods ---

  /**
   * @notice Instantiates a new program
   * @param encodedParameters Encoded parameters for program creation
   * @dev encodedParameters
   *  - _metaPtr URL pointing to the program metadata
   *  - _adminRoles Addresses to be granted DEFAULT_ADMIN_ROLE
   *  - _programOperators Addresses to be granted PROGRAM_OPERATOR_ROLE
   */
  function initialize(
    bytes calldata encodedParameters,
    string calldata newFoobar
  ) external initializer {

    foobar = newFoobar;
  
    // Decode _encodedParameters
    (
      MetaPtr memory _metaPtr,
      address[] memory _adminRoles,
      address[] memory _programOperators
    ) = abi.decode(
      encodedParameters, (
      MetaPtr,
      address[],
      address[]
    ));

    // Emit MetadataUpdated event for indexing
    emit MetadataUpdated(metaPtr, _metaPtr);
    metaPtr = _metaPtr;

    // Assigning default admin role
    for (uint256 i = 0; i < _adminRoles.length; ++i) {
      _grantRole(DEFAULT_ADMIN_ROLE, _adminRoles[i]);
    }

    // Assigning program operators
    for (uint256 i = 0; i < _programOperators.length; ++i) {
      _grantRole(PROGRAM_OPERATOR_ROLE, _programOperators[i]);
    }
  }

  // @notice Update metaPtr (only by PROGRAM_OPERATOR_ROLE)
  /// @param newMetaPtr new metaPtr
  function updateMetaPtr(MetaPtr memory newMetaPtr) external onlyRole(PROGRAM_OPERATOR_ROLE) {
    emit MetadataUpdated(metaPtr, newMetaPtr);
    metaPtr = newMetaPtr;
  }
}

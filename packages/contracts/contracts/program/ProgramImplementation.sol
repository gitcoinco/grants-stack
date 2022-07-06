// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "../utils/MetaPtr.sol";


/**
 * @notice Program which would managed by a group of 
 * PROGRAM_OPERATOR deployed via the ProgramFactory
 */
contract ProgramImplementation is AccessControlEnumerable, Initializable {

  // --- Libraries ---
  using Address for address;

  // --- Roles ---

  /// @notice program operator role
  bytes32 public constant PROGRAM_OPERATOR_ROLE = keccak256("PROGRAM_OPERATOR");

  // --- Events ---

  /// @notice Emitted when a team metadata pointer is updated
  event MetadataUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  // --- Data ---

  /// @notice URL pointing for program metadata (for off-chain use)
  MetaPtr public metaPtr;


  // --- Core methods ---

  /**
   * @notice Instantiates a new program
   * @param _encodedParameters Encoded parameters for program creation
   * @dev _encodedParameters
   *  - _metaPtr URL pointing to the program metadata
   *  - _adminRole Addresses to be granted DEFAULT_ADMIN_ROLE
   *  - _programOperators Addresses to be granted PROGRAM_OPERATOR_ROLE
   */
  function initialize(
    bytes calldata _encodedParameters
  ) public initializer {
  
    // Decode _encodedParameters
    (
      MetaPtr memory _metaPtr,
      address _adminRole,
      address[] memory _programOperators
    ) = abi.decode(
      _encodedParameters, (
      MetaPtr,
      address,
      address[]
    ));

    // Emit MetadataUpdated event for indexing
    emit MetadataUpdated(metaPtr, _metaPtr);
    metaPtr = _metaPtr;

    // assign roles
    _grantRole(DEFAULT_ADMIN_ROLE, _adminRole);

    // Assigning program operators
    for (uint256 i = 0; i < _programOperators.length; ++i) {
      _grantRole(PROGRAM_OPERATOR_ROLE, _programOperators[i]);
    }
  }

  // @notice Update metaPtr (only by PROGRAM_OPERATOR_ROLE)
  /// @param _newMetaPtr new metaPtr
  function updateMetaPtr(MetaPtr memory _newMetaPtr) public onlyRole(PROGRAM_OPERATOR_ROLE) {
    emit MetadataUpdated(metaPtr, _newMetaPtr);
    metaPtr = _newMetaPtr;
  }
}
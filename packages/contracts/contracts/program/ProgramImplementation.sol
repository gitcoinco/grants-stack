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
   * @param _metaPtr URL pointing to the program metadata
   * @param _programOperators Addresses to be granted PROGRAM_OPERATOR_ROLE
   */
  function initialize(
    MetaPtr memory _metaPtr,
    address[] memory _programOperators
  ) public initializer {
  
    metaPtr = _metaPtr;

    // assign roles
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

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
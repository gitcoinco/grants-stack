// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "./GrantRoundImplementation.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GrantRoundFactory is Ownable {

  address public grantRoundContract;

  // --- Event ---

  /// @notice Emitted when a GrantRound contract is upgradeds
  event GrantRoundContractUpgraded(address grantRoundAddress);

  /// @notice Emitted when a new GrantRound is created
  event GrantRoundCreated(address grantRoundAddress);


  // --- Core methods ---
  function updateGrantRoundContract(address _grantRoundContract) public onlyOwner {
    grantRoundContract = _grantRoundContract;

    emit GrantRoundContractUpgraded(_grantRoundContract);
  }

  function create(
    IVote _votingContract,
    uint256 _grantApplicationsStartTime,
    uint256 _roundStartTime,
    uint256 _roundEndTime,
    IERC20 _token,
    string calldata _metaPtr,
    address[] calldata _roundOperators
  ) external returns (address) {

    address clone = Clones.clone(grantRoundContract);

    GrantRoundImplementation(clone).initialize(
      _votingContract,
      _grantApplicationsStartTime,
      _roundStartTime,
      _roundEndTime,
      _token,
      _metaPtr,
      _roundOperators
    );

    emit GrantRoundCreated(clone);

    return clone;
  }

}
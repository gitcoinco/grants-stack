// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "./GrantRound.sol";
import "@optionality.io/clone-factory/contracts/CloneFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GrantRoundFactory is Ownable, CloneFactory {

  address public grantRoundContract;

  // --- Event ---

  /// @notice Emitted when a GrantRound contract is upgradeds
  event GrantRoundContractUpgraded(address grantRoundAddress);

  /// @notice Emitted when a new GrantRound is created
  event GrantRoundCreated(address grantRoundAddress);


  function updateGrantRoundContract(address _grantRoundContract) public onlyOwner {
    grantRoundContract = _grantRoundContract;

    emit GrantRoundContractUpgraded(_grantRoundContract);
  }

  function create(
    IERC20 _token,
    string _metaPtr,
    address[] _roundManagers
  ) {
    address clone = createClone(grantRoundContract);
    GrantRound(clone).init(_token, _metaPtr, _roundManagers);

    GrantRoundCreated(clone);
  }

}

/**
  Questions:
  - How do we handle multi chain round.
  - Assuming factory is on chain X and we want to deploy round on chain Y
    Wouldn't this be an tricky cause Factory would have to handle cross chain deployment
  - Alternative: The factory could be repurposed to GrantRoundRegistry : 
    which the backend would call after it's deployed a GrantRound
    Another issue is if this could be invoked by anyone -> how do we avoid spamming ?s 
 */
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
  constructor(uint256 initialSupply) ERC20("Mock", "MCK") {
    _mint(msg.sender, initialSupply);
  }

  function mint(uint256 amount) external {
    _mint(msg.sender, amount);
  }
}
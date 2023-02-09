
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;


import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./RoundFactory.sol";
import "../votingStrategy/IVotingStrategy.sol";
import "../payoutStrategy/IPayoutStrategy.sol";

import "../utils/MetaPtr.sol";

/**
 * @notice Contract deployed per Round which would managed by
 * a group of ROUND_OPERATOR via the RoundFactory
 *
 */
contract RoundImplementation is AccessControlEnumerable, Initializable {

  string public constant VERSION = "0.2.0";

  // --- Libraries ---
  using Address for address;
  using SafeERC20 for IERC20;

  // --- Roles ---

  /// @notice round operator role
  bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");


  // --- Events ---

  /// @notice Emitted when amount is updated
  event AmountUpdated(uint256 newAmount);

  /// @notice Emitted when the round metaPtr is updated
  event RoundMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  /// @notice Emitted when the application form metaPtr is updated
  event ApplicationMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  /// @notice Emitted when application start time is updated
  event ApplicationsStartTimeUpdated(uint256 oldTime, uint256 newTime);

  /// @notice Emitted when application end time is updated
  event ApplicationsEndTimeUpdated(uint256 oldTime, uint256 newTime);

  /// @notice Emitted when a round start time is updated
  event RoundStartTimeUpdated(uint256 oldTime, uint256 newTime);

  /// @notice Emitted when a round end time is updated
  event RoundEndTimeUpdated(uint256 oldTime, uint256 newTime);

  /// @notice Emitted when projects metaPtr is updated
  event ProjectsMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  /// @notice Emitted when a project has applied to the round
  event NewProjectApplication(bytes32 indexed project, MetaPtr applicationMetaPtr);

  /// @notice Emitted when a protocol fee is paid
  event PayFeeAndEscrowFundsToPayoutContract(uint256 amount, uint feeAmount);

  // --- Modifier ---

  /// @notice modifier to check if round has not ended.
  modifier roundHasNotEnded() {
    // slither-disable-next-line timestamp
    require(block.timestamp <= roundEndTime, "round has ended");
   _;
  }

  /// @notice modifier to check if round has not ended.
  modifier roundHasEnded() {
    // slither-disable-next-line timestamp
    require(block.timestamp > roundEndTime, "round has not ended");
   _;
  }

  // --- Data ---

  /// @notice Round Factory Contract Address
  RoundFactory public roundFactory;

  /// @notice Voting Strategy Contract Address
  IVotingStrategy public votingStrategy;

  /// @notice Payout Strategy Contract Address
  IPayoutStrategy public payoutStrategy;

  /// @notice Unix timestamp from when round can accept applications
  uint256 public applicationsStartTime;

  /// @notice Unix timestamp from when round stops accepting applications
  uint256 public applicationsEndTime;

  /// @notice Unix timestamp of the start of the round
  uint256 public roundStartTime;

  /// @notice Unix timestamp of the end of the round
  uint256 public roundEndTime;

  /// @notice Token Amount (excluding protocol fee)
  uint256 public amount;

  /// @notice Token used to payout match amounts at the end of a round
  address public token;

  /// @notice MetaPtr to the round metadata
  MetaPtr public roundMetaPtr;

  /// @notice MetaPtr to the application form schema
  MetaPtr public applicationMetaPtr;

  /// @notice MetaPtr to the projects
  MetaPtr public projectsMetaPtr;

  // --- Struct ---

  struct InitAddress {
    IVotingStrategy votingStrategy; // Deployed voting strategy contract
    IPayoutStrategy payoutStrategy; // Deployed payout strategy contract
  }

  struct InitRoundTime {
    uint256 applicationsStartTime; // Unix timestamp from when round can accept applications
    uint256 applicationsEndTime; // Unix timestamp from when round stops accepting applications
    uint256 roundStartTime; // Unix timestamp of the start of the round
    uint256 roundEndTime; // Unix timestamp of the end of the round
  }

  struct InitMetaPtr {
    MetaPtr roundMetaPtr; // MetaPtr to the round metadata
    MetaPtr applicationMetaPtr; // MetaPtr to the application form schema
  }

  struct InitRoles {
    address[] adminRoles; // Addresses to be granted DEFAULT_ADMIN_ROLE
    address[] roundOperators; // Addresses to be granted ROUND_OPERATOR_ROLE
  }

  // --- Core methods ---

  /**
   * @notice Instantiates a new round
   * @param encodedParameters Encoded parameters for program creation
   * @dev encodedParameters
   *  - _initAddress Related contract / wallet addresses
   *  - _initRoundTime Round timestamps
   *  - _feePercentage Fee percentage
   *  - _amount Amount of tokens in the matching pool
   *  - _token Address of the ERC20/native token for accepting matching pool contributions
   *  - _initMetaPtr Round metaPtrs
   *  - _initRoles Round roles
   */
  function initialize(
    bytes calldata encodedParameters,
    address _roundFactory
  ) external initializer {
    // Decode _encodedParameters
    (
      InitAddress memory _initAddress,
      InitRoundTime memory _initRoundTime,
      uint256 _amount,
      address _token,
      InitMetaPtr memory _initMetaPtr,
      InitRoles memory _initRoles
    ) = abi.decode(
      encodedParameters, (
      (InitAddress),
      (InitRoundTime),
      uint256,
      address,
      (InitMetaPtr),
      (InitRoles)
    ));

    // slither-disable-next-line timestamp
    require(
      _initRoundTime.applicationsStartTime >= block.timestamp,
      "time has already passed"
    );
    require(
      _initRoundTime.applicationsEndTime > _initRoundTime.applicationsStartTime,
      "app end is before app start"
    );
    require(
      _initRoundTime.roundEndTime >= _initRoundTime.applicationsEndTime,
      "round end is before app end"
    );
    require(
      _initRoundTime.roundEndTime > _initRoundTime.roundStartTime,
      "round end is before round start"
    );
    require(
      _initRoundTime.roundStartTime >= _initRoundTime.applicationsStartTime,
      "round start is before app start"
    );

    roundFactory = RoundFactory(_roundFactory);

    votingStrategy = _initAddress.votingStrategy;
    payoutStrategy = _initAddress.payoutStrategy;
    applicationsStartTime = _initRoundTime.applicationsStartTime;
    applicationsEndTime = _initRoundTime.applicationsEndTime;
    roundStartTime = _initRoundTime.roundStartTime;
    roundEndTime = _initRoundTime.roundEndTime;
    token = _token;

    // Invoke init on voting contract
    votingStrategy.init();

    // Invoke init on payout contract
    payoutStrategy.init();

    amount = _amount;
    roundMetaPtr = _initMetaPtr.roundMetaPtr;
    applicationMetaPtr = _initMetaPtr.applicationMetaPtr;

    // Assigning default admin role
    for (uint256 i = 0; i < _initRoles.adminRoles.length; ++i) {
      _grantRole(DEFAULT_ADMIN_ROLE, _initRoles.adminRoles[i]);
    }

    // Assigning round operators
    for (uint256 i = 0; i < _initRoles.roundOperators.length; ++i) {
      _grantRole(ROUND_OPERATOR_ROLE, _initRoles.roundOperators[i]);
    }
  }

  // @notice Update amount (only by ROUND_OPERATOR_ROLE)
  /// @param newAmount new Amount
  function updateAmount(uint256 newAmount) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {

    amount = newAmount;

    emit AmountUpdated(newAmount);
  }

  // @notice Update roundMetaPtr (only by ROUND_OPERATOR_ROLE)
  /// @param newRoundMetaPtr new roundMetaPtr
  function updateRoundMetaPtr(MetaPtr memory newRoundMetaPtr) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {

    emit RoundMetaPtrUpdated(roundMetaPtr, newRoundMetaPtr);

    roundMetaPtr = newRoundMetaPtr;
  }

  // @notice Update applicationMetaPtr (only by ROUND_OPERATOR_ROLE)
  /// @param newApplicationMetaPtr new applicationMetaPtr
  function updateApplicationMetaPtr(MetaPtr memory newApplicationMetaPtr) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {

    emit ApplicationMetaPtrUpdated(applicationMetaPtr, newApplicationMetaPtr);

    applicationMetaPtr = newApplicationMetaPtr;
  }

  /// @notice Update roundStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param newRoundStartTime new roundStartTime
  function updateRoundStartTime(uint256 newRoundStartTime) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newRoundStartTime >= block.timestamp, "time has already passed");
    require(newRoundStartTime >= applicationsStartTime, "is before app start");
    require(newRoundStartTime < roundEndTime, "is after round end");

    emit RoundStartTimeUpdated(roundStartTime, newRoundStartTime);

    roundStartTime = newRoundStartTime;
  }

  /// @notice Update roundEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param newRoundEndTime new roundEndTime
  function updateRoundEndTime(uint256 newRoundEndTime) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newRoundEndTime >= block.timestamp, "time has already passed");
    require(newRoundEndTime > roundStartTime, "is before round start");
    require(newRoundEndTime >= applicationsEndTime, "is before app end");

    emit RoundEndTimeUpdated(roundEndTime, newRoundEndTime);

    roundEndTime = newRoundEndTime;
  }

  /// @notice Update applicationsStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param newApplicationsStartTime new applicationsStartTime
  function updateApplicationsStartTime(uint256 newApplicationsStartTime) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newApplicationsStartTime >= block.timestamp, "time has already passed");
    require(newApplicationsStartTime <= roundStartTime, "is after round start");
    require(newApplicationsStartTime < applicationsEndTime, "is after app end");

    emit ApplicationsStartTimeUpdated(applicationsStartTime, newApplicationsStartTime);

    applicationsStartTime = newApplicationsStartTime;
  }

  /// @notice Update applicationsEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param newApplicationsEndTime new applicationsEndTime
  function updateApplicationsEndTime(uint256 newApplicationsEndTime) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newApplicationsEndTime >= block.timestamp, "time has already passed");
    require(newApplicationsEndTime > applicationsStartTime, "is before app start");
    require(newApplicationsEndTime <= roundEndTime, "is after round end");

    emit ApplicationsEndTimeUpdated(applicationsEndTime, newApplicationsEndTime);

    applicationsEndTime = newApplicationsEndTime;
  }

  /// @notice Update projectsMetaPtr (only by ROUND_OPERATOR_ROLE)
  /// @param newProjectsMetaPtr new ProjectsMetaPtr
  function updateProjectsMetaPtr(MetaPtr calldata newProjectsMetaPtr) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {

    emit ProjectsMetaPtrUpdated(projectsMetaPtr, newProjectsMetaPtr);

    projectsMetaPtr = newProjectsMetaPtr;
  }

  /// @notice Submit a project application
  /// @param projectID unique hash of the project
  /// @param newApplicationMetaPtr appliction metaPtr
  function applyToRound(bytes32 projectID, MetaPtr calldata newApplicationMetaPtr) external {
    // slither-disable-next-line timestamp
    require(
      applicationsStartTime <= block.timestamp  &&
      block.timestamp <= applicationsEndTime,
      "applications period over"
    );
    emit NewProjectApplication(projectID, newApplicationMetaPtr);
  }

  /// @notice Invoked by voter to cast votes
  /// @param encodedVotes encoded vote
  function vote(bytes[] memory encodedVotes) external payable {
    // slither-disable-next-line timestamp
    require(
      roundStartTime <= block.timestamp &&
      block.timestamp <= roundEndTime,
      "round is not active"
    );

    votingStrategy.vote{value: msg.value}(encodedVotes, msg.sender);
  }

  /// @notice Pay Protocol Fees and transfer funds to payout contract (only by ROUND_OPERATOR_ROLE)
  /// @param encodedPayoutData encoded payout data
  function payout(bytes[] memory encodedPayoutData) external payable roundHasEnded onlyRole(ROUND_OPERATOR_ROLE) {

    uint256 fundsInContract = _getTokenBalance();
    uint256 feeAmount = (amount * roundFactory.protocolFeePercentage() / 100);

    // total amount to be present in the contract
    uint256 expectedAmount = amount + feeAmount;

    require(fundsInContract >= expectedAmount, "not enough funds");

    // deduct fee
    address payable protocolTreasury = roundFactory.protocolTreasury();
    _transferAmount(protocolTreasury, feeAmount);

    // transfer funds to payout contract
    if (token == address(0)) {
      payoutStrategy.payout{value: fundsInContract}(encodedPayoutData);
    } else {
      IERC20(token).safeTransfer(address(payoutStrategy), fundsInContract);
      payoutStrategy.payout(encodedPayoutData);
    }

    emit PayFeeAndEscrowFundsToPayoutContract(amount, feeAmount);
  }

  /// @notice Util function to get token balance in the contract
  function _getTokenBalance() private view returns (uint256) {
    if (token == address(0)) {
      return address(this).balance;
    } else {
      return IERC20(token).balanceOf(address(this));
    }
  }

  /// @notice Util function to transfer amount to recipient
  function _transferAmount(address payable _recipient, uint256 _amount) private {
    if (token == address(0)) {
      Address.sendValue(_recipient, _amount);
    } else {
      IERC20(token).safeTransfer(_recipient, _amount);
    }
  }

}

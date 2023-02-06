
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;


import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

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

  /// @notice Emitted when amount is updater
  event AmountUpdated(uint256 newAmount, uint256 oldAmount);

  /// @notice Emitted when fee percentage is updated
  event FeePercentageUpdated(uint256 newFeePercentage);

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
    require(block.timestamp <= roundEndTime, "error: round has ended");
   _;
  }

  /// @notice modifier to check if round has not ended.
  modifier roundHasEnded() {
    // slither-disable-next-line timestamp
    require(block.timestamp > roundEndTime, "error: round has not ended");
   _;
  }

  // --- Data ---

  /// @notice Voting Strategy Contract Address
  IVotingStrategy public votingStrategy;

  /// @notice Payout Strategy Contract Address
  IPayoutStrategy public payoutStrategy;

  /// @notice Address to which fees are sent
  address payable public protocolTreasury;

  /// @notice Fee percentage
  uint256 public feePercentage;

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
    address payable withdrawFundsAddress; // Address to which funds are sent when withdrawn
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
    address payable _protocolTreasury
  ) external initializer {
    // Decode _encodedParameters
    (
      InitAddress memory _initAddress,
      InitRoundTime memory _initRoundTime,
      uint256 _feePercentage,
      uint256 _amount,
      address _token,
      InitMetaPtr memory _initMetaPtr,
      InitRoles memory _initRoles
    ) = abi.decode(
      encodedParameters, (
      (InitAddress),
      (InitRoundTime),
      uint256,
      uint256,
      address,
      (InitMetaPtr),
      (InitRoles)
    ));

    // slither-disable-next-line timestamp
    require(
      _initRoundTime.applicationsStartTime >= block.timestamp,
      "initialize: applications start time has already passed"
    );
    require(
      _initRoundTime.applicationsEndTime > _initRoundTime.applicationsStartTime,
      "initialize: application end time should be after application start time"
    );
    require(
      _initRoundTime.roundEndTime >= _initRoundTime.applicationsEndTime,
      "initialize: application end time should be before round end time"
    );
    require(
      _initRoundTime.roundEndTime > _initRoundTime.roundStartTime,
      "initialize: end time should be after start time"
    );
    require(
      _initRoundTime.roundStartTime >= _initRoundTime.applicationsStartTime,
      "initialize: round start time should be after application start time"
    );

    protocolTreasury = _protocolTreasury;
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
    payoutStrategy.init(_initAddress.withdrawFundsAddress);

    // Emit AmountUpdated event for indexing
    emit AmountUpdated(amount, _amount);
    amount = _amount;

    // Emit FeePercentageUpdated event for indexing
    emit FeePercentageUpdated(_feePercentage);
    feePercentage = _feePercentage;

    // Emit RoundMetaPtrUpdated event for indexing
    emit RoundMetaPtrUpdated(roundMetaPtr, _initMetaPtr.roundMetaPtr);
    roundMetaPtr = _initMetaPtr.roundMetaPtr;

    // Emit ApplicationMetaPtrUpdated event for indexing
    emit ApplicationMetaPtrUpdated(applicationMetaPtr, _initMetaPtr.applicationMetaPtr);
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

    emit AmountUpdated(newAmount, amount);

    amount = newAmount;
  }

  // @notice Update feePercentage (only by ROUND_OPERATOR_ROLE)
  /// @param newFeePercentage new feePercentage
  function updateFeePercentage(uint256 newFeePercentage) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {

    emit FeePercentageUpdated(newFeePercentage);

    feePercentage = newFeePercentage;
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
    require(newRoundStartTime >= block.timestamp, "updateRoundStartTime: start time has already passed");
    require(newRoundStartTime >= applicationsStartTime, "updateRoundStartTime: start time should be after application start time");
    require(newRoundStartTime < roundEndTime, "updateRoundStartTime: start time should be before round end time");

    emit RoundStartTimeUpdated(roundStartTime, newRoundStartTime);

    roundStartTime = newRoundStartTime;
  }

  /// @notice Update roundEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param newRoundEndTime new roundEndTime
  function updateRoundEndTime(uint256 newRoundEndTime) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newRoundEndTime >= block.timestamp, "updateRoundEndTime: end time has already passed");
    require(newRoundEndTime > roundStartTime, "updateRoundEndTime: end time should be after start time");
    require(newRoundEndTime >= applicationsEndTime, "updateRoundEndTime: end time should be after application end time");

    emit RoundEndTimeUpdated(roundEndTime, newRoundEndTime);

    roundEndTime = newRoundEndTime;
  }

  /// @notice Update applicationsStartTime (only by ROUND_OPERATOR_ROLE)
  /// @param newApplicationsStartTime new applicationsStartTime
  function updateApplicationsStartTime(uint256 newApplicationsStartTime) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newApplicationsStartTime >= block.timestamp, "updateApplicationsStartTime: application start time has already passed");
    require(newApplicationsStartTime <= roundStartTime, "updateApplicationsStartTime: should be before round start time");
    require(newApplicationsStartTime < applicationsEndTime, "updateApplicationsStartTime: should be before application end time");

    emit ApplicationsStartTimeUpdated(applicationsStartTime, newApplicationsStartTime);

    applicationsStartTime = newApplicationsStartTime;
  }

  /// @notice Update applicationsEndTime (only by ROUND_OPERATOR_ROLE)
  /// @param newApplicationsEndTime new applicationsEndTime
  function updateApplicationsEndTime(uint256 newApplicationsEndTime) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {
    // slither-disable-next-line timestamp
    require(newApplicationsEndTime >= block.timestamp, "updateApplicationsEndTime: application end time has already passed");
    require(newApplicationsEndTime > applicationsStartTime, "updateApplicationsEndTime: application end time should be after application start time");
    require(newApplicationsEndTime <= roundEndTime, "updateApplicationsEndTime: should be before round end time");

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
      "applyToRound: round is not accepting application"
    );
    emit NewProjectApplication(projectID, newApplicationMetaPtr);
  }

  /// @notice Invoked by voter to cast votes
  /// @param encodedVotes encoded vote
  /// @dev value is to handle native token voting
  function vote(bytes[] memory encodedVotes) external payable {
    // slither-disable-next-line timestamp
    require(
      roundStartTime <= block.timestamp &&
      block.timestamp <= roundEndTime,
      "vote: round is not active"
    );

    votingStrategy.vote{value: msg.value}(encodedVotes, msg.sender);
  }

  /// @notice Payout Funds (only by ROUND_OPERATOR_ROLE)
  /// @param encodedPayoutData encoded payout data
  /// @dev
  ///  - Can be invoked after round has ended
  ///  - Fee is sent to protocol treasury
  function payout(bytes[] memory encodedPayoutData) external payable roundHasEnded onlyRole(ROUND_OPERATOR_ROLE) {

    uint256 fundsInContract = _getTokenBalance();
    uint256 feeAmount = (amount * feePercentage / 100);
    uint256 expectedAmount = amount + feeAmount;

    require(fundsInContract >= expectedAmount, "payout: not enough funds");

    // deduct fee
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

  /**
   * Util function to get token balance in the contract
   */
  function _getTokenBalance() private view returns (uint256) {
    if (token == address(0)) {
      return address(this).balance;
    } else {
      return IERC20(token).balanceOf(address(this));
    }
  }

  /**
   * Util function to get token balance in the contract
   */
  function _transferAmount(address payable _recipient, uint256 _amount) private {
    if (token == address(0)) {
      Address.sendValue(_recipient, _amount);
    } else {
      IERC20(token).safeTransfer(_recipient, _amount);
    }
  }

}

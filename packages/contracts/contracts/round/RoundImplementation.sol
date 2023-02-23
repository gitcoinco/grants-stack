
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

  string public constant VERSION = "1.0.0";

  // --- Libraries ---
  using Address for address;
  using SafeERC20 for IERC20;

  // --- Roles ---

  /// @notice round operator role
  bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");


  // --- Events ---

  /// @notice Emitted when match amount is updated
  event MatchAmountUpdated(uint256 newAmount);

   /// @notice Emitted when a Round fee percentage is updated
  event RoundFeePercentageUpdated(uint8 roundFeePercentage);

  /// @notice Emitted when a Round wallet address is updated
  event RoundFeeAddressUpdated(address roundFeeAddress);

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

  /// @notice Emitted when protocol & round fees are paid
  event PayFeeAndEscrowFundsToPayoutContract(uint256 matchAmountAfterFees, uint protocolFeeAmount, uint roundFeeAmount);

  // --- Modifier ---

  /// @notice modifier to check if round has not ended.
  modifier roundHasNotEnded() {
    // slither-disable-next-line timestamp
    require(block.timestamp <= roundEndTime, "Round: Round has ended");
   _;
  }

  /// @notice modifier to check if round has not ended.
  modifier roundHasEnded() {
    // slither-disable-next-line timestamp
    require(block.timestamp > roundEndTime, "Round: Round has not ended");
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

  /// @notice Match Amount (excluding protocol fee & round fee)
  uint256 public matchAmount;

  /// @notice Token used to payout match amounts at the end of a round
  address public token;

  /// @notice Round fee percentage
  uint8 public roundFeePercentage;

  /// @notice Round fee address
  address payable public roundFeeAddress;

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
   *  - _matchAmount Amount of tokens in the matching pool
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
      uint256 _matchAmount,
      address _token,
      uint8 _roundFeePercentage,
      address payable _roundFeeAddress,
      InitMetaPtr memory _initMetaPtr,
      InitRoles memory _initRoles
    ) = abi.decode(
      encodedParameters, (
      (InitAddress),
      (InitRoundTime),
      uint256,
      address,
      uint8,
      address,
      (InitMetaPtr),
      (InitRoles)
    ));

    // slither-disable-next-line timestamp
    require(
      _initRoundTime.applicationsStartTime >= block.timestamp,
      "Round: Time has already passed"
    );
    require(
      _initRoundTime.applicationsEndTime > _initRoundTime.applicationsStartTime,
      "Round: App end is before app start"
    );
    require(
      _initRoundTime.roundEndTime >= _initRoundTime.applicationsEndTime,
      "Round: Round end is before app end"
    );
    require(
      _initRoundTime.roundEndTime > _initRoundTime.roundStartTime,
      "Round: Round end is before round start"
    );
    require(
      _initRoundTime.roundStartTime >= _initRoundTime.applicationsStartTime,
      "Round: Round start is before app start"
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

    matchAmount = _matchAmount;
    roundFeePercentage = _roundFeePercentage;
    roundFeeAddress = _roundFeeAddress;
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

  // @notice Update match amount (only by ROUND_OPERATOR_ROLE)
  /// @param newAmount new Amount
  function updateMatchAmount(uint256 newAmount) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {

    require(newAmount > matchAmount, "Round: Lesser than current match amount");

    matchAmount = newAmount;

    emit MatchAmountUpdated(newAmount);
  }

  // @notice Update round fee percentage (only by ROUND_OPERATOR_ROLE)
  /// @param newFeePercentage new fee percentage
  function updateRoundFeePercentage(uint8 newFeePercentage) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {

    roundFeePercentage = newFeePercentage;

    emit RoundFeePercentageUpdated(roundFeePercentage);
  }

  // @notice Update round fee address (only by ROUND_OPERATOR_ROLE)
  /// @param newFeeAddress new fee address
  function updateRoundFeeAddress(address payable newFeeAddress) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {

    roundFeeAddress = newFeeAddress;

    emit RoundFeeAddressUpdated(roundFeeAddress);
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

  /// @notice Update application, round start & end times (only by ROUND_OPERATOR_ROLE)
  /// @dev Only updates if new time is in the future and current set time is also in the future
  /// @param newApplicationsStartTime new applicationsStartTime
  /// @param newApplicationsEndTime new applicationsEndTime
  /// @param newRoundStartTime new roundStartTime
  /// @param newRoundEndTime new roundEndTime
  function updateStartAndEndTimes(
    uint256 newApplicationsStartTime,
    uint256 newApplicationsEndTime,
    uint256 newRoundStartTime,
    uint256 newRoundEndTime
  ) external roundHasNotEnded onlyRole(ROUND_OPERATOR_ROLE) {

    // slither-disable-next-line timestamp
    require(newApplicationsStartTime < newApplicationsEndTime, "Round: Application end is before application start");
    require(newRoundStartTime < newRoundEndTime, "Round: Round end is before round start");
    require(newApplicationsStartTime <= newRoundStartTime, "Round: Round start is before application start");
    require(newApplicationsEndTime <= newRoundEndTime, "Round: Round end is before application end");
    require(block.timestamp <= newApplicationsStartTime, "Round: Time has already passed");

    if (
      applicationsStartTime >= block.timestamp &&
      newApplicationsStartTime != applicationsStartTime
    ) {
      emit ApplicationsStartTimeUpdated(applicationsStartTime, newApplicationsStartTime);
      applicationsStartTime = newApplicationsStartTime;
    }

    if (
      applicationsEndTime >= block.timestamp &&
      newApplicationsEndTime != applicationsEndTime
    ) {
      emit ApplicationsEndTimeUpdated(applicationsEndTime, newApplicationsEndTime);
      applicationsEndTime = newApplicationsEndTime;
    }

    if (
      roundStartTime >= block.timestamp &&
      newRoundStartTime != roundStartTime
    ) {
      emit RoundStartTimeUpdated(roundStartTime, newRoundStartTime);
      roundStartTime = newRoundStartTime;
    }

    if (
      roundEndTime >= block.timestamp &&
      newRoundEndTime != roundEndTime
    ) {
      emit RoundEndTimeUpdated(roundEndTime, newRoundEndTime);
      roundEndTime = newRoundEndTime;
    }

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
      "Round: Applications period over"
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
      "Round: Round is not active"
    );

    votingStrategy.vote{value: msg.value}(encodedVotes, msg.sender);
  }

  /// @notice Pay Protocol & Round Fees and transfer funds to payout contract (only by ROUND_OPERATOR_ROLE)
  function setReadyForPayout() external payable roundHasEnded onlyRole(ROUND_OPERATOR_ROLE) {

    uint256 fundsInContract = _getTokenBalance(token);

    uint256 protocolFeeAmount = (matchAmount * roundFactory.protocolFeePercentage() / 100);
    uint256 roundFeeAmount = (matchAmount * roundFeePercentage / 100);

    // total funds needed for payout
    uint256 neededFunds = matchAmount + protocolFeeAmount + roundFeeAmount;

    require(fundsInContract >= neededFunds, "Round: Not enough funds in contract");

    // deduct protocol fee
    if (protocolFeeAmount > 0) {
      address payable protocolTreasury = roundFactory.protocolTreasury();
      _transferAmount(protocolTreasury, protocolFeeAmount, token);
    }

    // deduct round fee
    if (roundFeeAmount > 0) {
      _transferAmount(roundFeeAddress, roundFeeAmount, token);
    }

    // update funds in contract after fee deduction
    fundsInContract = _getTokenBalance(token);

    // transfer funds to payout contract
    if (token == address(0)) {
      payoutStrategy.setReadyForPayout{value: fundsInContract}();
    } else {
      IERC20(token).safeTransfer(address(payoutStrategy), fundsInContract);
      payoutStrategy.setReadyForPayout();
    }

    emit PayFeeAndEscrowFundsToPayoutContract(fundsInContract, protocolFeeAmount, roundFeeAmount);
  }

  /// @notice Withdraw funds from the contract (only by ROUND_OPERATOR_ROLE)
  /// @param tokenAddress token address
  // @param recipent recipient address
  function withdraw(address tokenAddress, address payable recipent) external onlyRole(ROUND_OPERATOR_ROLE) {
    require(tokenAddress != token, "Round: Cannot withdraw round token");
    _transferAmount(recipent, _getTokenBalance(tokenAddress), tokenAddress);
  }

  /// @notice Util function to get token balance in the contract
  /// @param tokenAddress token address
  function _getTokenBalance(address tokenAddress) private view returns (uint256) {
    if (tokenAddress == address(0)) {
      return address(this).balance;
    } else {
      return IERC20(tokenAddress).balanceOf(address(this));
    }
  }

  /// @notice Util function to transfer amount to recipient
  /// @param _recipient recipient address
  /// @param _amount amount to transfer
  /// @param _tokenAddress token address
  function _transferAmount(address payable _recipient, uint256 _amount, address _tokenAddress) private {
    if (_tokenAddress == address(0)) {
      Address.sendValue(_recipient, _amount);
    } else {
      IERC20(_tokenAddress).safeTransfer(_recipient, _amount);
    }
  }

  receive() external payable {}
}

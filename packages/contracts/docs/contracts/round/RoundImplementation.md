# RoundImplementation





Contract deployed per Round which would managed by a group of ROUND_OPERATOR via the RoundFactory



## Methods

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### ROUND_OPERATOR_ROLE

```solidity
function ROUND_OPERATOR_ROLE() external view returns (bytes32)
```

round operator role




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### VERSION

```solidity
function VERSION() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### applicationMetaPtr

```solidity
function applicationMetaPtr() external view returns (uint256 protocol, string pointer)
```

MetaPtr to the application form schema




#### Returns

| Name | Type | Description |
|---|---|---|
| protocol | uint256 | undefined |
| pointer | string | undefined |

### applicationsEndTime

```solidity
function applicationsEndTime() external view returns (uint256)
```

Unix timestamp from when round stops accepting applications




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### applicationsStartTime

```solidity
function applicationsStartTime() external view returns (uint256)
```

Unix timestamp from when round can accept applications




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### applyToRound

```solidity
function applyToRound(bytes32 projectID, MetaPtr newApplicationMetaPtr) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| projectID | bytes32 | undefined |
| newApplicationMetaPtr | MetaPtr | undefined |

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```



*Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role&#39;s admin, use {_setRoleAdmin}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### getRoleMember

```solidity
function getRoleMember(bytes32 role, uint256 index) external view returns (address)
```



*Returns one of the accounts that have `role`. `index` must be a value between 0 and {getRoleMemberCount}, non-inclusive. Role bearers are not sorted in any particular way, and their ordering may change at any point. WARNING: When using {getRoleMember} and {getRoleMemberCount}, make sure you perform all queries on the same block. See the following https://forum.openzeppelin.com/t/iterating-over-elements-on-enumerableset-in-openzeppelin-contracts/2296[forum post] for more information.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getRoleMemberCount

```solidity
function getRoleMemberCount(bytes32 role) external view returns (uint256)
```



*Returns the number of accounts that have `role`. Can be used together with {getRoleMember} to enumerate all bearers of a role.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### grantRole

```solidity
function grantRole(bytes32 role, address account) external nonpayable
```



*Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``&#39;s admin role. May emit a {RoleGranted} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```



*Returns `true` if `account` has been granted `role`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### initialize

```solidity
function initialize(bytes encodedParameters, address _roundFactory) external nonpayable
```

Instantiates a new round

*encodedParameters  - _initAddress Related contract / wallet addresses  - _initRoundTime Round timestamps  - _feePercentage Fee percentage  - _matchAmount Amount of tokens in the matching pool  - _token Address of the ERC20/native token for accepting matching pool contributions  - _initMetaPtr Round metaPtrs  - _initRoles Round roles*

#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedParameters | bytes | Encoded parameters for program creation |
| _roundFactory | address | undefined |

### matchAmount

```solidity
function matchAmount() external view returns (uint256)
```

Match Amount (excluding protocol fee &amp; round fee)




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### payoutStrategy

```solidity
function payoutStrategy() external view returns (contract IPayoutStrategy)
```

Payout Strategy Contract Address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IPayoutStrategy | undefined |

### projectsMetaPtr

```solidity
function projectsMetaPtr() external view returns (uint256 protocol, string pointer)
```

MetaPtr to the projects




#### Returns

| Name | Type | Description |
|---|---|---|
| protocol | uint256 | undefined |
| pointer | string | undefined |

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function&#39;s purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`. May emit a {RoleRevoked} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``&#39;s admin role. May emit a {RoleRevoked} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### roundEndTime

```solidity
function roundEndTime() external view returns (uint256)
```

Unix timestamp of the end of the round




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### roundFactory

```solidity
function roundFactory() external view returns (contract RoundFactory)
```

Round Factory Contract Address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract RoundFactory | undefined |

### roundFeeAddress

```solidity
function roundFeeAddress() external view returns (address payable)
```

Round fee address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address payable | undefined |

### roundFeePercentage

```solidity
function roundFeePercentage() external view returns (uint8)
```

Round fee percentage




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | undefined |

### roundMetaPtr

```solidity
function roundMetaPtr() external view returns (uint256 protocol, string pointer)
```

MetaPtr to the round metadata




#### Returns

| Name | Type | Description |
|---|---|---|
| protocol | uint256 | undefined |
| pointer | string | undefined |

### roundStartTime

```solidity
function roundStartTime() external view returns (uint256)
```

Unix timestamp of the start of the round




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### setReadyForPayout

```solidity
function setReadyForPayout() external payable
```

Pay Protocol &amp; Round Fees and transfer funds to payout contract (only by ROUND_OPERATOR_ROLE)




### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### token

```solidity
function token() external view returns (address)
```

Token used to payout match amounts at the end of a round




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### updateApplicationMetaPtr

```solidity
function updateApplicationMetaPtr(MetaPtr newApplicationMetaPtr) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newApplicationMetaPtr | MetaPtr | undefined |

### updateMatchAmount

```solidity
function updateMatchAmount(uint256 newAmount) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newAmount | uint256 | new Amount |

### updateProjectsMetaPtr

```solidity
function updateProjectsMetaPtr(MetaPtr newProjectsMetaPtr) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newProjectsMetaPtr | MetaPtr | undefined |

### updateRoundFeeAddress

```solidity
function updateRoundFeeAddress(address payable newFeeAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newFeeAddress | address payable | new fee address |

### updateRoundFeePercentage

```solidity
function updateRoundFeePercentage(uint8 newFeePercentage) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newFeePercentage | uint8 | new fee percentage |

### updateRoundMetaPtr

```solidity
function updateRoundMetaPtr(MetaPtr newRoundMetaPtr) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newRoundMetaPtr | MetaPtr | undefined |

### updateStartAndEndTimes

```solidity
function updateStartAndEndTimes(uint256 newApplicationsStartTime, uint256 newApplicationsEndTime, uint256 newRoundStartTime, uint256 newRoundEndTime) external nonpayable
```

Update application, round start &amp; end times (only by ROUND_OPERATOR_ROLE)

*Only updates if new time is in the future and current set time is also in the future*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newApplicationsStartTime | uint256 | new applicationsStartTime |
| newApplicationsEndTime | uint256 | new applicationsEndTime |
| newRoundStartTime | uint256 | new roundStartTime |
| newRoundEndTime | uint256 | new roundEndTime |

### vote

```solidity
function vote(bytes[] encodedVotes) external payable
```

Invoked by voter to cast votes



#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedVotes | bytes[] | encoded vote |

### votingStrategy

```solidity
function votingStrategy() external view returns (contract IVotingStrategy)
```

Voting Strategy Contract Address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IVotingStrategy | undefined |

### withdraw

```solidity
function withdraw(address tokenAddress, address payable recipent) external nonpayable
```

Withdraw funds from the contract (only by ROUND_OPERATOR_ROLE)



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | token address |
| recipent | address payable | undefined |



## Events

### ApplicationMetaPtrUpdated

```solidity
event ApplicationMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr)
```

Emitted when the application form metaPtr is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| oldMetaPtr  | MetaPtr | undefined |
| newMetaPtr  | MetaPtr | undefined |

### ApplicationsEndTimeUpdated

```solidity
event ApplicationsEndTimeUpdated(uint256 oldTime, uint256 newTime)
```

Emitted when application end time is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| oldTime  | uint256 | undefined |
| newTime  | uint256 | undefined |

### ApplicationsStartTimeUpdated

```solidity
event ApplicationsStartTimeUpdated(uint256 oldTime, uint256 newTime)
```

Emitted when application start time is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| oldTime  | uint256 | undefined |
| newTime  | uint256 | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### MatchAmountUpdated

```solidity
event MatchAmountUpdated(uint256 newAmount)
```

Emitted when match amount is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| newAmount  | uint256 | undefined |

### NewProjectApplication

```solidity
event NewProjectApplication(bytes32 indexed project, MetaPtr applicationMetaPtr)
```

Emitted when a project has applied to the round



#### Parameters

| Name | Type | Description |
|---|---|---|
| project `indexed` | bytes32 | undefined |
| applicationMetaPtr  | MetaPtr | undefined |

### PayFeeAndEscrowFundsToPayoutContract

```solidity
event PayFeeAndEscrowFundsToPayoutContract(uint256 matchAmountAfterFees, uint256 protocolFeeAmount, uint256 roundFeeAmount)
```

Emitted when protocol &amp; round fees are paid



#### Parameters

| Name | Type | Description |
|---|---|---|
| matchAmountAfterFees  | uint256 | undefined |
| protocolFeeAmount  | uint256 | undefined |
| roundFeeAmount  | uint256 | undefined |

### ProjectsMetaPtrUpdated

```solidity
event ProjectsMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr)
```

Emitted when projects metaPtr is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| oldMetaPtr  | MetaPtr | undefined |
| newMetaPtr  | MetaPtr | undefined |

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| previousAdminRole `indexed` | bytes32 | undefined |
| newAdminRole `indexed` | bytes32 | undefined |

### RoleGranted

```solidity
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### RoleRevoked

```solidity
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### RoundEndTimeUpdated

```solidity
event RoundEndTimeUpdated(uint256 oldTime, uint256 newTime)
```

Emitted when a round end time is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| oldTime  | uint256 | undefined |
| newTime  | uint256 | undefined |

### RoundFeeAddressUpdated

```solidity
event RoundFeeAddressUpdated(address roundFeeAddress)
```

Emitted when a Round wallet address is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| roundFeeAddress  | address | undefined |

### RoundFeePercentageUpdated

```solidity
event RoundFeePercentageUpdated(uint8 roundFeePercentage)
```

Emitted when a Round fee percentage is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| roundFeePercentage  | uint8 | undefined |

### RoundMetaPtrUpdated

```solidity
event RoundMetaPtrUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr)
```

Emitted when the round metaPtr is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| oldMetaPtr  | MetaPtr | undefined |
| newMetaPtr  | MetaPtr | undefined |

### RoundStartTimeUpdated

```solidity
event RoundStartTimeUpdated(uint256 oldTime, uint256 newTime)
```

Emitted when a round start time is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| oldTime  | uint256 | undefined |
| newTime  | uint256 | undefined |




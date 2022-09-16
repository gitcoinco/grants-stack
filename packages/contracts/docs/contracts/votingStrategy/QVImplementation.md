# QVImplementation





Contract deployed per Round which would be managed by a group of ROUND_OPERATOR



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



*Round operator role*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### VOTE_CREDITS

```solidity
function VOTE_CREDITS() external view returns (uint256)
```

The voters initial vote credit amount




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### currentTally

```solidity
function currentTally() external view returns (bytes)
```

The tally count.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined |

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



*Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``&#39;s admin role.*

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
function initialize(bytes encodedParameters) external nonpayable
```

Instantiates a new QV contract

*encodedParameters  - _voteCredits Vote credits allocated to each voter  - _voterBadge Voter badge address  - _adminRoles Addresses to be granted DEFAULT_ADMIN_ROLE  - _roundOperators Addresses to be granted ROUND_OPERATOR_ROLE*

#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedParameters | bytes | Encoded parameters for program creation |

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function&#39;s purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``&#39;s admin role.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

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

### tallies

```solidity
function tallies(bytes32) external view returns (uint256 voteCredits, uint256 votes)
```

Mapping of vote ID to vote data.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| voteCredits | uint256 | undefined |
| votes | uint256 | undefined |

### tally

```solidity
function tally() external nonpayable
```

Tally the votes.

*This function will calculate and store the a tally of the votes. This can be called at any time by anyone.*


### updateVoterRegister

```solidity
function updateVoterRegister(address newVoterRegister) external nonpayable
```

Update voter badge (only by ROUND_OPERATOR_ROLE)



#### Parameters

| Name | Type | Description |
|---|---|---|
| newVoterRegister | address | New voter badge |

### vote

```solidity
function vote(bytes[] encodedVotes, address voterAddress) external nonpayable
```

Invoked by RoundImplementation which allows a voter to cast votes to multiple grants during a round

*- this would be triggered when a voter casts their vote via round explorer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedVotes | bytes[] | encoded list of votes |
| voterAddress | address | voter address |

### voteCreditsUsed

```solidity
function voteCreditsUsed(address) external view returns (uint256)
```

Mapping of voter address to vote credits used.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### voterRegister

```solidity
function voterRegister() external view returns (address)
```

The voter register contract




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### votesData

```solidity
function votesData(uint256) external view returns (bytes)
```

Vote data storage



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

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

### Tallied

```solidity
event Tallied(bytes oldTally, bytes indexed currentTally)
```

Emitted when the votes are tallied



#### Parameters

| Name | Type | Description |
|---|---|---|
| oldTally  | bytes | undefined |
| currentTally `indexed` | bytes | undefined |

### Voted

```solidity
event Voted(address indexed voterAddress, bytes32 indexed grantID, uint256 indexed voteCredits, uint256 votes)
```

Emited when a voter votes for a grantee



#### Parameters

| Name | Type | Description |
|---|---|---|
| voterAddress `indexed` | address | undefined |
| grantID `indexed` | bytes32 | undefined |
| voteCredits `indexed` | uint256 | undefined |
| votes  | uint256 | undefined |

### VoterRegisterUpdated

```solidity
event VoterRegisterUpdated(address indexed oldVoterRegister, address indexed newVoterRegister)
```

Emitted when the voter badge is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| oldVoterRegister `indexed` | address | undefined |
| newVoterRegister `indexed` | address | undefined |




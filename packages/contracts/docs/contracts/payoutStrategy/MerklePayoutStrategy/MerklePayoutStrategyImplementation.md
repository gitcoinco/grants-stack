# MerklePayoutStrategyImplementation





Merkle Payout Strategy contract which is deployed once per round and is used to upload the final match distribution.



## Methods

### LOCK_DURATION

```solidity
function LOCK_DURATION() external view returns (uint256)
```

Locking duration




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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

### _distribute

```solidity
function _distribute(bytes _distribution) external nonpayable
```

Util function to distribute funds to recipient



#### Parameters

| Name | Type | Description |
|---|---|---|
| _distribution | bytes | encoded distribution |

### distribute

```solidity
function distribute(MerklePayoutStrategyImplementation.Distribution distribution) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| distribution | MerklePayoutStrategyImplementation.Distribution | undefined |

### distribute_encode

```solidity
function distribute_encode(bytes _distribution) external nonpayable
```

Util function to distribute funds to recipient



#### Parameters

| Name | Type | Description |
|---|---|---|
| _distribution | bytes | undefined |

### distributionMetaPtr

```solidity
function distributionMetaPtr() external view returns (uint256 protocol, string pointer)
```

MetaPtr containing the distribution




#### Returns

| Name | Type | Description |
|---|---|---|
| protocol | uint256 | undefined |
| pointer | string | undefined |

### hasBeenDistributed

```solidity
function hasBeenDistributed(uint256 _index) external view returns (bool)
```

Util function to check if distribution is done



#### Parameters

| Name | Type | Description |
|---|---|---|
| _index | uint256 | index of the distribution |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### init

```solidity
function init() external nonpayable
```

Invoked by RoundImplementation on creation to set the round for which the payout strategy is to be used




### initialize

```solidity
function initialize() external nonpayable
```






### isReadyForPayout

```solidity
function isReadyForPayout() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### merkleRoot

```solidity
function merkleRoot() external view returns (bytes32)
```

merkle root generated from distribution




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### payout

```solidity
function payout(bytes[] _distributions) external payable
```

MerklePayoutStrategy implementation of payout Can be invoked only by round operator and isReadyForPayout is true



#### Parameters

| Name | Type | Description |
|---|---|---|
| _distributions | bytes[] | encoded distributions |

### reclaimLockEndTime

```solidity
function reclaimLockEndTime() external view returns (uint256)
```

Relclaim lock end time




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### roundAddress

```solidity
function roundAddress() external view returns (address payable)
```

RoundImplementation address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address payable | undefined |

### setReadyForPayout

```solidity
function setReadyForPayout() external payable
```

Invoked by RoundImplementation to set isReadyForPayout




### tokenAddress

```solidity
function tokenAddress() external view returns (address)
```

Token address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### updateDistribution

```solidity
function updateDistribution(bytes encodedDistribution) external nonpayable
```

Invoked by round operator to update the - merkle root - distribution MetaPtr



#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedDistribution | bytes | encoded distribution |

### withdrawFunds

```solidity
function withdrawFunds(address payable withdrawAddress) external payable
```

Invoked by RoundImplementation to withdraw funds to withdrawAddress from the payout contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| withdrawAddress | address payable | withdraw funds address |



## Events

### BatchPayoutSuccessful

```solidity
event BatchPayoutSuccessful(address indexed sender)
```

Emitted when batch payout is successful



#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | undefined |

### DistributionUpdated

```solidity
event DistributionUpdated(bytes32 merkleRoot, MetaPtr distributionMetaPtr)
```

Emitted when the distribution is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot  | bytes32 | undefined |
| distributionMetaPtr  | MetaPtr | undefined |

### FundsDistributed

```solidity
event FundsDistributed(address indexed sender, address indexed grantee, address indexed token, uint256 amount)
```

Emitted when funds are distributed



#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | undefined |
| grantee `indexed` | address | undefined |
| token `indexed` | address | undefined |
| amount  | uint256 | undefined |

### FundsWithdrawn

```solidity
event FundsWithdrawn(address indexed tokenAddress, uint256 amount, address withdrawAddress)
```

Emitted when funds are withdrawn from the payout contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress `indexed` | address | undefined |
| amount  | uint256 | undefined |
| withdrawAddress  | address | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### ReadyForPayout

```solidity
event ReadyForPayout()
```

Emitted when contract is ready for payout




### ReclaimFunds

```solidity
event ReclaimFunds(address indexed sender, address indexed token, uint256 indexed amount)
```

Emitted when funds are reclaimed



#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | undefined |
| token `indexed` | address | undefined |
| amount `indexed` | uint256 | undefined |




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

payout function defined in IPayoutStrategy

*NOT IMPLEMENTED. Use payout(Distribution[] calldata _distributions) instead*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _distributions | bytes[] | encoded distribution |

### payout

```solidity
function payout(MerklePayoutStrategyImplementation.Distribution[] _distributions) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _distributions | MerklePayoutStrategyImplementation.Distribution[] | undefined |

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

Invoked by round operator to update the merkle root and distribution MetaPtr



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
event FundsDistributed(uint256 amount, address grantee, address indexed token, bytes32 indexed projectId)
```

Emitted when funds are distributed



#### Parameters

| Name | Type | Description |
|---|---|---|
| amount  | uint256 | undefined |
| grantee  | address | undefined |
| token `indexed` | address | undefined |
| projectId `indexed` | bytes32 | undefined |

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







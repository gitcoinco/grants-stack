# IPayoutStrategy





Defines the abstract contract for payout strategies for a round. Any new payout strategy would be expected to extend this abstract contract. Every PayoutStrategyImplementation contract would be unique to RoundImplementation and would be deployed before creating a round. Functions that are marked as `virtual` are expected to be overridden by the implementation contract. - updateDistribution - payout

*- Deployed before creating a round  - Funds are transferred to the payout contract from round only during payout*

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

### endLockingTime

```solidity
function endLockingTime() external view returns (uint256)
```

End locking time




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### init

```solidity
function init() external nonpayable
```

Invoked by RoundImplementation on creation to set the round for which the payout strategy is to be used




### payout

```solidity
function payout(bytes[] _encodedPayoutData) external payable
```

Invoked by RoundImplementation to trigger payout

*- should be invoked by RoundImplementation contract - could be used to trigger payout / enable payout - ideally IPayoutStrategy implementation should emit events after   payout is triggered Modifiers:  - isRoundOperator  - roundHasEnded*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _encodedPayoutData | bytes[] | encoded payout data |

### roundAddress

```solidity
function roundAddress() external view returns (address)
```

RoundImplementation address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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
function updateDistribution(bytes _encodedDistribution) external nonpayable
```

sInvoked by RoundImplementation to upload distribution to the payout strategy

*- should be invoked by RoundImplementation contract - ideally IPayoutStrategy implementation should emit events after   distribution is updated - would be invoked at the end of the round Modifiers:  - isRoundOperator  - roundHasEnded*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _encodedDistribution | bytes | encoded distribution |

### withdrawFunds

```solidity
function withdrawFunds(address payable withdrawFundsAddress) external nonpayable
```

Invoked by RoundImplementation to withdraw funds to withdrawFundsAddress from the payout contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| withdrawFundsAddress | address payable | withdraw funds address |



## Events

### FundsWithdrawn

```solidity
event FundsWithdrawn(address indexed tokenAddress, uint256 amount)
```

Emitted when funds are withdrawn from the payout contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress `indexed` | address | undefined |
| amount  | uint256 | undefined |




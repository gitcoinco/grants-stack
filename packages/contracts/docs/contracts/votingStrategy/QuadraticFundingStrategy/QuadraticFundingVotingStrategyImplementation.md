# QuadraticFundingVotingStrategyImplementation





Allows voters to cast multiple weighted votes to grants with one transaction This is inspired from BulkCheckout documented over at: https://github.com/gitcoinco/BulkTransactions/blob/master/contracts/BulkCheckout.sol Emits event upon every transfer.



## Methods

### init

```solidity
function init() external nonpayable
```

Invoked by RoundImplementation on creation to set the round for which the voting contracts is to be used




### initialize

```solidity
function initialize() external nonpayable
```






### roundAddress

```solidity
function roundAddress() external view returns (address)
```

Round address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### vote

```solidity
function vote(bytes[] encodedVotes, address voterAddress) external payable
```

Invoked by RoundImplementation which allows a voted to cast weighted votes to multiple grants during a round

*- more voters -&gt; higher the gas - this would be triggered when a voter casts their vote via grant explorer - can be invoked by the round - supports ERC20 and Native token transfer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedVotes | bytes[] | encoded list of votes |
| voterAddress | address | voter address |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### Voted

```solidity
event Voted(address token, uint256 amount, address indexed voter, address grantAddress, bytes32 indexed projectId, address indexed roundAddress)
```

Emitted when a new vote is sent



#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | undefined |
| amount  | uint256 | undefined |
| voter `indexed` | address | undefined |
| grantAddress  | address | undefined |
| projectId `indexed` | bytes32 | undefined |
| roundAddress `indexed` | address | undefined |




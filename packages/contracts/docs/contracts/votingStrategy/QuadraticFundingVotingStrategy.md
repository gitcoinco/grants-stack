# QuadraticFundingVotingStrategy





Allows voters to cast multiple weighted votes to grants with one transaction This is inspired from BulkCheckout documented over at: https://github.com/gitcoinco/BulkTransactions/blob/master/contracts/BulkCheckout.sol Emits event upon every transfer.



## Methods

### vote

```solidity
function vote(bytes[] encodedVotes, address voterAddress) external nonpayable
```

Invoked by RoundImplementation which allows a voted to cast weighted votes to multiple grants during a round

*- more voters -&gt; higher the gas - this would be triggered when a voter casts their vote via round explorer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedVotes | bytes[] | encoded list of votes |
| voterAddress | address | voter address |



## Events

### Voted

```solidity
event Voted(contract IERC20 token, uint256 amount, address indexed voter, address indexed grantAddress, address indexed roundAddress)
```

Emitted when a new vote is sent



#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | contract IERC20 | undefined |
| amount  | uint256 | undefined |
| voter `indexed` | address | undefined |
| grantAddress `indexed` | address | undefined |
| roundAddress `indexed` | address | undefined |




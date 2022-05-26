### GrantRound Setup

The section here shows how to set up the round manager for the first time on a given network. Ideally these steps would be done once per chain. In this example , we would be deploying on goerli

1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification

2. Deploy `GrantRoundFactory`
```shell
yarn run goerli-deploy-factory
```

3. Deploy `GrantRoundImplementation`
```shell
yarn run goerli-deploy-round
```

4. Update `round.config.ts` with deployed contracts based on your network
```javascript
export const params: DeployParams = {
  goerli: {
    grantRoundImplementationContract: 'DEPLOYED_ROUND_IMPLEMENTATION_CONTRACT',
    grantRoundFactoryContract: 'DEPLOYED_ROUND_FACTORY_CONTRACT',
    ...
  },
};
```

5. Update `GrantRoundFactory` to reference the `GrantRoundImplementation`
```shell
yarn run goerli-deploy-update-round
```

### Voting Setup

The section here shows how to set up voting mechanism for the first time on a given network. Ideally these steps would be done once per chain. In this example ,we would be deploying the BulkVote contract on goerli

1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification

2. Deploy the BulkVote contract.
```shell
yarn run goerli-deploy-bulk-vote
```

3. Update `round.config.ts` with deployed contracts based on your network
```javascript
export const params: DeployParams = {
  goerli: {
    bulkVoteContract: 'DEPLOYED_BULK_VOTE_CONTRACT',
    ...
  },
};
```

### Payout Setup
<!-- TODO -->


### Contract Verification on etherscan

```
yarn hardhat clean
yarn hardhat verify --network goerli <CONTRACT_ADDRESS>
```
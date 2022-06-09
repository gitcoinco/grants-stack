### Program Setup

The section here shows how to set up the program for the first time on a given network. Ideally these steps would be done once per chain. In this example , we would be deploying on goerli


1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification


2. Deploy the `ProgramFactory` contract
```shell
yarn run goerli-deploy-program-factory
```

3. Deploy the `ProgramImplementation` contract
```shell
yarn run goerli-deploy-program-implementation
```

4. Update `program.config.ts` with deployed contracts based on your network
```javascript
export const params: DeployParams = {
  goerli: {
    programImplementationContract: 'DEPLOYED_PROGRAM_IMPLEMENTATION_CONTRACT',
    programFactoryContract: 'DEPLOYED_PROGRAM_FACTORY_CONTRACT',
    ...
  },
};
```

5. Update `ProgramFactory` to reference the `ProgramImplementation` contract.
```shell
yarn run goerli-link-program-implementation
```


### GrantRound Setup

The section here shows how to set up the round manager for the first time on a given network. Ideally these steps would be done once per chain. In this example , we would be deploying on goerli

1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification


2. Deploy the `GrantRoundFactory` contract
```shell
yarn run goerli-deploy-round-factory
```

3. Deploy the `GrantRoundImplementation` contract
```shell
yarn run goerli-deploy-round-implementation
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

5. Update `GrantRoundFactory` to reference the `GrantRoundImplementation` contract
```shell
yarn run goerli-link-round-implementation
```

### Voting Setup

The section here shows how to set up voting mechanism for the first time on a given network. Ideally these steps would be done once per chain. In this example ,we would be deploying the BulkVote contract on goerli

1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification

2. Deploy the BulkVote contract.
```shell
yarn run goerli-deploy-bulk-vote-mech
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
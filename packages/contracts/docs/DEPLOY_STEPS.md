### Networks

The project has been configured to support the following networks.
All the deploy scripts will expect network param to know which network the contract deployment / interaction should take place

| network            |
|--------------------|
| `goerli`           |
| `optimism-mainnet` |
| `optimism-kovan`  |

### Program Setup

The section here shows how to set up the program for the first time on a given network. Ideally these steps would be done once per chain. In this example , we would be deploying on goerli


1. Create an `.env` file
```sh
cp ../.env.example ../.env
```
and fill in your own values

    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification


2. Deploy the `ProgramFactory` contract
```shell
yarn run deploy-program-factory goerli
```

3. Deploy the `ProgramImplementation` contract
```shell
yarn run deploy-program-implementation goerli
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
yarn run link-program-implementation goerli
```


### Round Setup

The section here shows how to set up the round manager for the first time on a given network. Ideally these steps would be done once per chain. In this example , we would be deploying on goerli

1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification


2. Deploy the `RoundFactory` contract
```shell
yarn run deploy-round-factory goerli
```

3. Deploy the `RoundImplementation` contract
```shell
yarn run deploy-round-implementation goerli
```

4. Update `round.config.ts` with deployed contracts based on your network
```javascript
export const params: DeployParams = {
  goerli: {
    roundImplementationContract: 'DEPLOYED_ROUND_IMPLEMENTATION_CONTRACT',
    roundFactoryContract: 'DEPLOYED_ROUND_FACTORY_CONTRACT',
    ...
  },
  ...
};
```

5. Update `RoundFactory` to reference the `RoundImplementation` contract
```shell
yarn run link-round-implementation goerli
```

### VotingStrategy Setup

The section here shows how to set up voting strategy for the first time on a given network. Ideally these steps would be done once per chain. In this example ,we would be deploying the BulkVotingStrategy contract on goerli

1. Create an `.env` file and fill out
    - `INFURA_ID`               : Infura ID for deploying contract
    - `DEPLOYER_PRIVATE_KEY`    : address which deploys the contract
    - `ETHERSCAN_API_KEY`       : API key for etherscan verification

2. Deploy the BulkVotingStrategy contract.
```shell
yarn run deploy-bulk-voting-strategy goerli
```

3. Update `round.config.ts` with deployed contracts based on your network
```javascript
export const params: DeployParams = {
  goerli: {
    BulkVotingStrategyContract: 'DEPLOYED_BULK_VOTE_CONTRACT',
    ...
  },
  ...
};
```

### Payout Setup
<!-- TODO -->


### Contract Verification on etherscan

```
yarn hardhat clean
yarn hardhat verify --network goerli <CONTRACT_ADDRESS>
```
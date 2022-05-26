### GrantRound Setup

The documentation here shows how to set up the round manager for the first time on a given network. Ideally these steps would be done once per chain. In this example ,we would be deploying on INFURA

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

3. Update `round.config.ts` with deployed contracts based on your network
```javascript
export const params: DeployParams = {
  goerli: {
    grantRoundImplementationContract: 'DEPLOYED_ROUND_IMPLEMENTATION_CONTRACT',
    grantRoundFactoryContract: 'DEPLOYED_ROUND_FACTORY_CONTRACT'
  },
};
```

4. Update `GrantRoundFactory` to reference the `GrantRoundImplementation`
```shell
yarn run goerli-deploy-update-round
```

### Voting Setup
<!-- TODO -->

### Payout Setup
<!-- TODO -->


### Contract Verification on etherscan

```
yarn hardhat clean
yarn hardhat verify --network goerli <CONTRACT_ADDRESS>
```
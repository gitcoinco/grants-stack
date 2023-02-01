# Project Hub Contracts

The project hub contracts power the universal grant registry. It allows the creation and editing of projects. These projects can then apply to participate in [Grant Rounds](https://github.com/gitcoinco/grants-round/tree/main/packages/contracts/contracts/utils)

## Deploy

Enable the config file and edit it to set the value of the exported env variables:

`cp .env.example .env`

Deploy the `ProjectRegistry` contract:

```
npx hardhat run scripts/migrations/001-deploy-project-registry.ts --network goerli
```

The script above will deploy 3 contracts:

* The `ProjectRegistry` implementation.
* The `ProxyAdmin` used to upgrade the proxies.
* The `TransparentUpgradeableProxy` contract, which is the instance of `ProjectRegistry` that will be used.


## ⚠️ Implementations must be initialized⚠️

The scripts use the openzeppelin upgrades plugin to manage proxies deploys and upgrades.

The first deploy will also call the initializer automatically on the proxy.

On upgrade, the scrips must send a second transaction calling `initialize` after deploy.

After deploys and upgrades, **the implementations must be initialized manually**. The easiest way is to do it on etherescan.

# Directory Structure

```
.
├── artifacts
│   ├── build-info
│   ├── contracts
│   │   └── ProjectRegistry.sol
│   └── hardhat
│       └── console.sol
├── contracts
│   └── utils
├── coverage
│   ├── contracts
│   │   └── utils
│   └── lcov-report
│       └── contracts
│           └── utils
├── lib
├── scripts
│   └── migrations
├── test
└── typechain
    └── factories
```

# Common Commands

```shell
yarn hardhat compile
yarn hardhat clean
yarn hardhat test
yarn hardhat node
yarn hardhat help
REPORT_GAS=true yarn hardhat test
yarn hardhat coverage
yarn hardhat run scripts/deploy.ts
TS_NODE_FILES=true yarn ts-node scripts/deploy.ts
yarn eslint '**/*.{js,ts}'
yarn eslint '**/*.{js,ts}' --fix
yarn prettier '**/*.{json,sol,md}' --check
yarn prettier '**/*.{json,sol,md}' --write
yarn solhint 'contracts/**/*.sol'
yarn solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
yarn hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

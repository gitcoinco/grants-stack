## Development Instructions

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
$ yarn install
```

Create environment files, and replace environment variables with your own values
```sh
cp ../.env.example ../.env
```

### Compile

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn clean
$ yarn compile
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Test

Run the tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Generate ABI

Generate ABI of contracts. 
The generated ABI can be found within `abis/` folder
We generate both human readable ABI

```sh
yarn run clear-abi
yarn run export-abi
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true yarn test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

### Scripts

Contracts written here have deploy scripts written in `scripts/` directory.
The commands to run them are documented in `package.json`.
To get a better grasp of how the scripts can be used to deploy / interact with contracts.
Refer [DEPLOY_STEPS.md](https://github.com/gitcoinco/grants-round/blob/main/packages/contracts/docs/DEPLOY_STEPS.md)

Additionally if you are using vscode -> debug scripts are written up in `launch.json`
to make it easier to debug the script while running them.


Note: This package skeleton was generated using hardhat advanced generator

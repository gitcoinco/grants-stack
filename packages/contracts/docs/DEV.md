## Development Instructions

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
$ pnpm install
```

Create environment files, and replace environment variables with your own values
```sh
cp ../.env.example ../.env
```

### Compile

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ pnpm clean
$ pnpm compile
```

### Lint Solidity

Lint the Solidity code:

```sh
$ pnpm lint:sol
```

### Test

Run the tests:

```sh
$ pnpm test
```

### Coverage

Generate the code coverage report:

```sh
$ pnpm coverage
```

### Generate ABI

Generate ABI of contracts. 
The generated ABI can be found within `abis/` folder
We generate both human readable ABI

```sh
pnpm run clear-abi
pnpm run export-abi
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true pnpm test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ pnpm clean
```

### Scripts

Contracts written here have deploy scripts written in `scripts/` directory.
The commands to run them are documented in `package.json`.
To get a better grasp of how the scripts can be used to deploy / interact with contracts.
Refer [DEPLOY_STEPS.md](https://github.com/gitcoinco/grants-round/blob/main/packages/contracts/docs/DEPLOY_STEPS.md)

Additionally if you are using vscode -> debug scripts are written up in `launch.json`
to make it easier to debug the script while running them.


Note: This package skeleton was generated using hardhat advanced generator

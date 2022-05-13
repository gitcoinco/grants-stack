# grants-round/contracts

hardhat is the environment used to compile, deploy, test and debug the grants-round contract.

## Directory Structure

```
.
├── contracts                   # Smart contracts
├── scripts                     # Deploy scripts for smart contracts
├── test                        # Test for smart contracts
├── .env.example                # .env template
├── .eslintrc.js                # Eslint config
├── .prettierrc                 # Prettier config
├── .solhint.json               # Solhint config
├── hardhat.config.json         # Hardhat configuration
├── package.json                # Package configuration
├── tsconfig.json               # Typescript configuration
└── README.md
```

## Usage

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
$ yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn clean
$ yarn build
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
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

### Deployment

To test deploying the contracts locally, first start a localhost hardhat network.

```sh
$ yarn app:node
```


Note: This package skeleton was generated using hardhat advanced generator

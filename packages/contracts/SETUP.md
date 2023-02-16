# Setup

This guide will walk you through how to setup the project on your local machine.
It's intended for anyone who wishes to contribute to the development of the Allo
protocol, specifically by contributing to these smart contracts.

Before getting started here, please read through the [Contributing
Guide](./CONTRIBUTING.md) to learn about the project roadmap and how to get
involved.

Also, please note that we have not tested these setup instructions on every
possible machine, operating system, or configuration. If you run into an problem
getting this project set up, you may file [a bug
report](https://github.com/gitcoinco/grants-round/issues/new?assignees=&labels=bug&template=bug.md&title=)
but we can only prioritize problems related to the codebase itself and not
issues caused by your operating system or system configuration.

## Prerequisites

Before you get started, we assume you have a working knowledge of the following
tools and libraries:

- Node and pnpm
- Hardhat
- Solidity (including solcover and solhint)

## General Setup

After cloning the repo down, install all the dependencies with `pnpm`:

```shell
pnpm install
```

Create environment files, and replace environment variables with your own values
```sh
cp ../.env.example ../.env
```

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ pnpm clean
$ pnpm compile
```
## Usage

With the above, you should be good to start contributing, provided you've also
worked through the [contributing guide](./CONTRIBUTING.md). The following are
some other things you may want to know how to do.

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

### Deploy

Contracts written here have deploy scripts written in `scripts/` directory.
The commands to run them are documented in `package.json`.
To get a better grasp of how the scripts can be used to deploy / interact with contracts.
Please refer to [DEPLOY_STEPS.md](./docs/DEPLOY_STEPS.md).

Additionally if you are using vscode -> debug scripts are written up in `launch.json`
to make it easier to debug the script while running them.


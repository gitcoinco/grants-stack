# Development

Welcome to the Grants Stack development repository!
This repository houses the main three dApps that make up the Grants Stack ecosystem:

* [Builder](https://builder.gitcoin.co/)
* [Explorer](https://explorer.gitcoin.co/#/round/424/0x4473725beb9a9d503547d2fe677f4b5aa39b68f6)
* [Manager](https://manager.gitcoin.co/)

Each of these dapps is a single-page React application, and you can find their respective source code under the `/packages` folder.

If you are importing external libraries, please use the ones already added in the projects, or consider using one of the preferred options from this document: [LIBRARIES.md](./LIBRARIES.md)

While there is no central backend application, all three dApps rely on various external services for data reading and writing. These dependencies include:

1. **EVM Blockchains**: One or more EVM blockchains are used for reading from and writing to smart contracts.

2. **[allo-indexer](https://github.com/gitcoinco/allo-indexer)**: This indexer is employed to index on-chain data and generate Quadratic Funding (QF) matches.

3. **Subgraph Instances**: There is one subgraph instance for each blockchain to efficiently query blockchain data.

4. **IPFS**: IPFS is utilized for reading metadata files, providing decentralized file storage.

5. **[Pinata](https://www.pinata.cloud/)**: Pinata is used to upload and pin files to IPFS, ensuring the availability of data.


### Setup root project dependencies

```sh
cd grants-stack
pnpm install
```

### Setup Builder

```sh
cd packages/builder
cp .env.example .env
```

Create a WalletConnect application needed for RainbowKit: https://www.rainbowkit.com/docs/installation#configure
Set the WalletConnect applicationId in the .env file:

```
REACT_APP_WALLETCONNECT_PROJECT_ID=[YOUR APPLICATION ID]
```

Set your Alchemy API Key:

```
REACT_APP_ALCHEMY_ID=[YOUR ALCHEMY API KEY]
```

The default configuration loads data from the production indexer.
You can point your dapps to a local indexer changing the following variable:

```
REACT_APP_INDEXER_V2_API_URL=http://localhost:PORT_NUMBER
```

### Run Builder

Inside `packages/builder` run:

```
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Linting and formatting

We use Prettier for formatting and ESLint for linting. Prettier will auto-format your code before you commit, and linting will run before you push back to remote. The git hook config lies in the `lefthook.yml` file in the root of the repo.

### Testing

`pnpm test` will always run tests in whatever package you're in. We are migrating from Jest to Vitest on all the packages. If you encounter any issues with Jest, consult the [Knowledge base file](KB.md).

### Run in Production

Builds the app for production to the `build` folder.

```sh
$ pnpm build
```

Serve on port 3000

```sh
$ pnpm install -g serve
$ serve -s build -l 3000
```

### Adding a new route

Global routing configuration is held in `src/index.tsx`. Below is an example of a route definition

```jsx=
<Route path="/program/create" element={<CreateProgram />} />
<Route path="/program/:id" element={<ViewProgram />} />
```

A protected route i.e a routed which requires a user's wallet connection should be within the parent `ProtectedRoute`
component route

```jsx=
<Route element={<ProtectedRoute />}>
    <Route path="/program/create" element={<CreateProgram />} />
    <Route path="/program/:id" element={<ViewProgram />} />
</Route>
```

Find more information about routing [here](https://reactrouter.com/docs/en/v6).

## Running E2E tests using Synpress

Synpress is an E2E testing framework for testing dApps. It works by setting up metamask before every run.

### Running Synpress

1. Put `TEST_PRIVATE_KEY` in `.env.local` in the respective directory (e.g. `packages/round-manager`)
2. Start the dev server `pnpm start`
3. Download playwright with `pnpm exec playwright install`
4. Run tests with `pnpm synpress:test`

NOTE: some tests require you to be part of a testing program and have some gas in your wallet. Please use a private key that has some gas on Fantom Testnet and Optimism Mainnet, and is part of the "GS Optimism Program 10 Round" Program on Optimism Mainnet.


## Submitting a PR

Please always submit draft PRs at first, and make sure they pass the following conditions before you mark them as Ready for review.

We utilize git hooks for pre-commit
formatting and pre-push checks, which should help you catch issues early, before they fail the CI.

Before submitting a PR for review, ensure that it passes all the checks of the PR checklist. Also consider doing a self-review of the changes to reduce back-and-forth.

When the CI is green, PR checklist is ticked off and the PR is in good shape, submit it for review by clicking the "Ready for review" button.

## Local Development Environment

Depending on the configuration in your local `.env` file, you can choose to use these services directly or opt for a local version of them.

For faster development and a more responsive feedback loop, we recommend setting up a local development environment instead of relying on testnets
and external services directly.
We have provided a Docker Compose configuration that allows you to run local instances of the necessary services.

⚠️ Please note that the local development environment is still a work in progress,
and not all functionality are available locally.
We are continuously improving it to make your development experience as seamless as possible.

### Dependencies

* node
* docker

### Setup your wallet

All the contracts and test data in the local chains are owned by accounts derived from the same test mnemonic phrase.
To avoid confusion with your real accounts, you can create a new profile in your browser, install Metamask or any other wallets
that manages [hierarchical-deterministic wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki), and import the following test mnemonic to be able to derive all the used accounts:

```
test test test test test test test test test test test junk
```

Contracts are deployed with the default account at derivation path `m/44'/60'/0'/0/0`.
The same accounts owns some ready to use data, like projects, rounds, etc.

⚠️⚠️⚠️
When you start your local services, the main account's nonce gets reset,
so you should reset it manually in your wallet to make sure you don't accidentally send transactions with the wrong nonce.

If you use metamask keep your expanded view open:

`Menu -> Expand view`

And reset the wallet every time you restart the local chains:

`Menu -> Settings -> Advance -> CLear activity tab data`
⚠️⚠️⚠️

### Run local services

Clone the repo:

```sh
git clone git@github.com:gitcoinco/grants-stack.git
cd grants-stack
pnpm i
```

Run the services with `docker-compose` and follow the logs:

```sh
./scripts/dev up
```

Stop the services with:

```sh
./scripts/dev down
```

Populates the local chains with contracts and test data for Allo V1 and V2:

```sh
./scripts/dev setup
```

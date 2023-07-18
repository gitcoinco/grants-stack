# grant-explorer

This package serves the app which holds all the features w.r.t to

- exploring a round
- voting for a project

This package is meant to be used by the users who would want to explore rounds and contribute to the projects within a round
It relies on the contracts deployed from the [contracts](../contracts) package.
Indexed data can be queried by the graphs deployed from the Allo's [graph](https://github.com/Allo-Protocol/graph/blob/main/round/README.md) repository.

## Live Links

| Env     | Git Branch | URL                            |
| ------- | ---------- | ------------------------------ |
| STAGING | main       | https://gegitcoin.on.fleek.co/ |
| LIVE    | release    | https://explorer.gitcoin.co/   |

## Directory Structure

```
.
├── public                      # Public Assets
├── src
│   ├── app                     # Stores/Hooks
│   ├── features
│       ├── api                 # API services
│       ├── common              # Common features
│       ├── round               # Round related components/services
│   ├── browserPatches.tsx      # Browser polyfill
│   ├── index.tsx               # Routes
│   ├── index.css               # Global CSS
├── tsconfig.json               # Typescript configuration
├── craco.json                  # Craco configuration
├── package.json                # Package configuration
└── README.md
```

The app structure ensures all components and services related to a particular feature are kept in a subdirectory of the `features` directory.

Observe the directory structure for Authentication feature in `features/auth`

```
├── features
│   ├── auth
│   │   ├── ProtectedRoute.tsx
│   │   ├── web3Service.tsx
```

It contains the `ProtectedRoute` component and `web3Service` which extends the base API service defined in `src/api.ts` by endpoint injection.

## Development

To contribute to this project, fork the project and follow the instructions at [DEV.md](docs/DEV.md)

### Passport Integration

In your `.env` you will need to specify two environment variables for [Gitcoin Passport Integration](https://passport.gitcoin.co/#/).

Generate a community scorer API Key with the Passport Scorer Dashboard [here](https://www.scorer.gitcoin.co/dashboard) by selecting API Keys in the sidebar.

Specify the `https://api.scorer.gitcoin.co` for the `REACT_APP_PASSPORT_API_ENDPOINT` and your generated API key for `REACT_APP_PASSPORT_API_KEY` in your `.env`.

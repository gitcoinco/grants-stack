# round-manager

This package serves the app which holds all the features w.r.t to

- creating a program
- maintaining a program
- creating a round
- maintaining a round

This package is meant to be used by the round operators
Indexed data can be queried by the graphs deployed from Allo's [graph](https://github.com/Allo-Protocol/graph/blob/main/round/README.md) repository.

## Live Links

| Env     | Git Branch | URL                                    |
| ------- |------------|----------------------------------------|
| STAGING | main       | https://manager-staging.vercel.app/    |
| LIVE    | main       | https://manager.gitcoin.co/            |

## Directory Structure

```
.
├── public                      # Public Assets
├── src
│   ├── features
│       ├── program             # Program related components/services
│       ├── round               # Round related components/services
│   ├── browserPatches.tsx      # Browser polyfill
│   ├── index.tsx               # Routes
│   ├── index.css               # Global CSS
├── tsconfig.json               # Typescript configuration
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

## Encrypting PII information

Since all the data is decentralized stored, there might be PII (Personally identifiable information) data which we cannot store. To see how we handle those scenarios, checkout [EncryptingPII.md](docs/EncryptingPII.md)

### Development

To contribute to this package, fork the repo and follow the instructions at [DEV.md](../../docs/DEV.md)

### Monitoring

To set up monitoring for this project, follow the instructions at [MONITORING.md](docs/MONITORING.md)

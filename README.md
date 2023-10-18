# grants-round

This repository contains packages needed for a user to
- Create & Manage Rounds
- Explore available Rounds
- Vote for Projects within a Round

Project Maintained via  : `turborepo`
Package manager         : `pnpm`

## Packages

- round-manager: React application for managing rounds
- grant-explorer: React application for exploring the grants ecosystem
- builder: React application for managing projects
- common: components and functionality that is shared between projects
- eslint-config-gitcoin: common eslint config for all grants stack projects
- verify-env: a utility package and a webpack plugin for verifying the environment of an app during build


```
.
├── .github                     # github specific configuration
├── packages                    # individual frontends and related packages
├── package.json                # root package configuration
├── docs                        # documentation
└── README.md
```

##### Development

We welcome external contributions. Please make sure to familiarize yourself with the [Contribution Guidelines](CONTRIBUTING.md).

To contribute to this project, fork the repo and follow the instructions at [DEV.md](docs/DEV.md)

##### Hosting

All the apps are hosted on Vercel. Preview links get created automatically for PRs. Commits to main get deployed to production automatically.

# round-manager

This package serves the app which holds all the features w.r.t to managing a grant round.


## Directory Structure 

```
.
├── public                      # public assets
├── src
│   ├── app                     # stores/hooks
│   ├── features                # components / pages (loaded based on route)
│   ├── browserPatches.tsx      # browser polyfill
│   ├── index.tsx               # Routes
│   ├── index.css               # CSS 
├── tsconfig.json               # Typescript documentation 
├── craco.json                  # Craco configuration
├── package.json                # Package configuration
└── README.md
```

## Usage

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
$ yarn install
```

### Start

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

```sh
$ yarn start
```

### Test

Launches the test runner.

```sh
$ yarn test
```

### Build

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

```sh
$ yarn build
```


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) TS template.

# Grants Stack Knowledge Base

A place to store solutions to common problems.
Each section contains a header of people to talk to if you can't find the solution to your problem.

## General

Always verify
- you are on the right branch
- `rm -rf node_modules && pnpm install`
- the code you are editing is the same code you are debugging (you haven't accidentally opened a prod/staging deployment in the browser)
- you have all the required environment variables set to correct values - compare with what is on Fleek on staging/prod and against `.env.example`

## Jest
Ask: `@atris.` on Discord

verify the following:
- `jest` and `jest-environment-jsdom` package versions are the same
- you are using the `jest` or `@craco/craco` package from the project you are debugging

### ES Modules vs. CommonJS

Jest errors out with `SyntaxError: Cannot use import statement outside a module`.
This is most likely a package that ships as an ES Module, but doesn't correctly declare it. (`type: module` in package.json or `.mjs`extension). Jest by default doesn't apply transforms (typescript, babel, swc) to `node_modules` because of performance, but you can tell it to transform a module, which transforms it to CommonJS syntax that Jest understands. [How to do this](https://jestjs.io/docs/configuration/#transformignorepatterns-arraystring)

### Importing svgs, css etc.

This usually happens when you are testing a React Component that imports some kind of static asset - svgs, images etc. Jest uses Node to run tests. When your node comes across an import of `svg`, it will error out since it doesn't understand it. You need to tell Jest to transform those modules to some kind of stub, empty javascript object etc. so that Node can correctly import it. This is done automatically by `craco test`, and can be implemented manually [as described here](https://jestjs.io/docs/configuration/#transform-objectstring-pathtotransformer--pathtotransformer-object)

## Linting

### Linting passes on local and fails on CI

ESLint by default returns a non-zero return code (fancy way of saying **fails** in Unix terminology) only for errors, not for warnings. However, when the `CI` environment variable is set, ESLint treats warnings as errors, so it will fail for any kind of warning in CI. Use the `pnpm lint:ci` script to fail for warnings locally.

## Typescript

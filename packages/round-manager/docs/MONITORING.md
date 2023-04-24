# Monitoring

round-manager relies datadog's

- Datadog Real User Monitoring (RUM) : [@datadog/browser-rum](https://www.npmjs.com/package/@datadog/browser-rum)
- Datadog Browser Logs : [@datadog/browser-logs](https://www.npmjs.com/package/@datadog/browser-logs)

## Setup

Ensure the `.env` variables are populated.

```
REACT_APP_DATADOG_APPLICATION_ID=######################
REACT_APP_DATADOG_CLIENT_TOKEN=######################
REACT_APP_DATADOG_SERVICE=######################
REACT_APP_DATADOG_SITE=######################
```

These can be configured from your datadog account, and you can customize the collection information over
at [datadog.tsx](../src/datadog.tsx)

## Logging

When a new route is created, ensure you add the following to make the debugging easier.

```javascript
import { datadogLogs } from "@datadog/browser-logs";

datadogLogs.logger.info(`====> Route: {ADD_ROUTE_PATH}`);
datadogLogs.logger.info(`====> URL: ${window.location.href}`);
```

To log exceptions errors in datadog. Add logs in the following manner at possible failure points.

```javascript
import { datadogRum } from "@datadog/browser-rum";

datadogRum.addError(e, { provider: providerId });
```

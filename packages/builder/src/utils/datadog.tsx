import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";

/**
 * Initialize datadog at a global level
 *  - Datadog Real User Monitoring (RUM) : https://www.npmjs.com/package/@datadog/browser-rum
 *  - Datadog Brower Logs : https://www.npmjs.com/package/@datadog/browser-logs
 */
const initDatadog = () => {
  // Init datadog-rum
  datadogRum.init({
    applicationId: process.env.REACT_APP_DATADOG_APPLICATION_ID || "",
    clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN || "",
    site: process.env.REACT_APP_DATADOG_SITE || "datadoghq.eu",
    service: process.env.REACT_APP_DATADOG_SERVICE || "",
    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0',
    sampleRate: 100,
    premiumSampleRate: 100,
    trackInteractions: false,
    defaultPrivacyLevel: "mask-user-input",
  });

  // Init datadog-logs
  datadogLogs.init({
    clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN || "",
    site: "datadoghq.eu",
    forwardErrorsToLogs: true,
    sampleRate: 100,
    service: "grant-hub",
  });
};

export default initDatadog;

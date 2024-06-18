import posthog from "posthog-js";

export const initPosthog = () => {
  console.log("Initializing Posthog");
  if (process.env.REACT_APP_POSTHOG_KEY && process.env.REACT_APP_POSTHOG_HOST) {
    posthog.init(process.env.REACT_APP_POSTHOG_KEY, {
      api_host: process.env.REACT_APP_POSTHOG_HOST,
      session_recording: {
        maskTextSelector: '[data-testid="rk-account-button"]',
      },
    });

    console.log("Posthog initialized");

    return posthog;
  }

  console.log("Posthog not initialized");

  return undefined;
};

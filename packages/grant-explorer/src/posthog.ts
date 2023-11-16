import posthog from "posthog-js";

export const initPosthog = () => {
  if (process.env.REACT_APP_POSTHOG_TOKEN) {
    posthog.init(process.env.REACT_APP_POSTHOG_TOKEN, {
      api_host: "https://grants-stack-ux-events.gitcoin.co",
      session_recording: {
        maskTextSelector: '[data-testid="rk-account-button"]',
      },
    });
  }
};

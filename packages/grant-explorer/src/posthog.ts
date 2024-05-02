import posthog from "posthog-js";

export const initPosthog = () => {
  console.log("Initializing Posthog");
  if (
    process.env.REACT_APP_PUBLIC_POSTHOG_KEY &&
    process.env.REACT_APP_PUBLIC_POSTHOG_HOST
  ) {
    posthog.init(process.env.REACT_APP_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
      session_recording: {
        maskTextSelector: '[data-testid="rk-account-button"]',
      },
      // note: https://posthog.com/docs/product-analytics/autocapture
      // autocapture: {
      //   dom_event_allowlist: ["click"], // DOM events from this list ['click', 'change', 'submit']
      //   url_allowlist: ["posthog.com./docs/.*"], // strings or RegExps
      //   element_allowlist: ["button"], // DOM elements from this list ['a', 'button', 'form', 'input', 'select', 'textarea', 'label']
      //   css_selector_allowlist: ["[ph-autocapture]"], // List of CSS selectors
      // },
    });

    console.log("Posthog initialized");

    return posthog;
  }

  console.log("Posthog not initialized");
};

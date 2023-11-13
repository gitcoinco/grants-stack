import posthog from "posthog-js";

export const initPosthog = () => {
  // Temporary version just for trying out
  if (process.env.NODE_ENV === "production") {
    posthog.init("phc_mB6lwjs3uusyGi4sB5yBPy9sIyk03uoDaJ71k28USYH", {
      api_host: "https://eu.posthog.com",
    });
  }

  // Final version in case we merge (remember to set the env variable on Vercel)
  // if (process.env. REACT_APP_POSTHOG_TOKEN) {
  //   posthog.init(process.env. REACT_APP_POSTHOG_TOKEN, {
  //     api_host: "https://eu.posthog.com",
  //   });
  // }
};

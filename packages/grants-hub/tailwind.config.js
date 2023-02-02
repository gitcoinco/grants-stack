module.exports = {
  // if this is not set it will default to user's operating system preferences
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "gitcoin-sm": "0px 1px 2px rgba(0, 0, 0, 0.05)",
      },
      colors: {
        "primary-background": "#6F3FF5",
        "secondary-background": "#0E0333",
        "danger-background": "#D03E63",
        "primary-text": "#0E0333",
        "secondary-text": "#757087",
        "tertiary-text": "#E2E0E7",
        "quaternary-text": "#FFFFFF",
        "danger-text": "#D03E63",
        "green-text": "#11BC92",
        "gitcoin-gold": "#E1B815",
        "gitcoin-grey-50": "#F3F3F5",
        "gitcoin-grey-100": "#E2E0E7",
        "gitcoin-grey-300": "#A7A2B6",
        "gitcoin-grey-400": "#757087",
        "gitcoin-grey-500": "#0E0333",
        "gitcoin-yellow": "#FFF8DB",
        "gitcoin-yellow-500": "#E1B815",
        "gitcoin-pink-100": "#FDDEE4",
        "gitcoin-pink-200": "#FAADBF",
        "gitcoin-pink-400": "#F3587D",
        "gitcoin-pink-500": "#D44D6E",
        "gitcoin-teal-100": "#E6FFF9",
        "gitcoin-teal-500": "#11BC92",
        "gitcoin-violet-100": "#F0EBFF",
        "gitcoin-violet-400": "#6F3FF5",
        "gitcoin-violet-500": "#5932C4",
        "gitcoin-separator": "#757087",
        "modal-button": "#664AEC",
      },
      width: {
        "dropdown-menu": "17.5rem",
      },
    },
    fontFamily: {
      sans: ['"Libre Franklin"'],
    },
  },
  important: true,
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
  ],
};

module.exports = {
  // if this is not set it will default to user's operating system preferences
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Very open to better naming here :)
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
        "gitcoin-yellow": "#FFF8DB",
        "gitcoin-pink-500": "#D44D6E",
        "gitcoin-pink-100": "#FDDEE4",
      }
    }
  },
  important: true,
}

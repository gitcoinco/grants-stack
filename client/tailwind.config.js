module.exports = {
  // if this is not set it will default to user's operating system preferences
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-background": "#6F3FF5",
        "secondary-background": "#0E0333",
        "danger-background": "#D03E63",
        "primary-text": "#0E0333",
        "secondary-text": "#757087",


        "dark-primary": "#6F3FF5",
        "primary-text": "#FFFFFF",
        "dark-secondary": "#757087",
        "light-secondary": "#261c47",
        "red": "red"
      }
    }
  },
  important: true,
}

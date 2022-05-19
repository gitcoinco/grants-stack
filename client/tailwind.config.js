module.exports = {
  // if this is not set it will default to user's operating system preferences
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-primary": "#0E0333",
        "light-primary": "#FFFFFF",
        "dark-secondary": "#261c47",
        "light-secondary": "#261c47",
        "red": "red"
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  important: true,
}

const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Miriam Libre", "sans-serif"],
        sans: [
          "Libre Franklin",
          "sans-serif",
          ...fontFamily.sans,
        ],
      },
    },
  },
  plugins: [],
}

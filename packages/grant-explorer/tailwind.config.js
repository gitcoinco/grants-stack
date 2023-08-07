module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
      },
      colors: {
        transparent: "transparent",
        black: "#000",
        white: "#FFF",
        grey: {
          50: "#F3F3F5",
          100: "#E2E0E7",
          150: "#F3F3F5",
          200: "#C4C1CF",
          250: "#BEBEBE",
          300: "#A7A2B6",
          400: "#757087",
          500: "#0E0333",
        },
        violet: {
          100: "#F0EBFF",
          200: "#C9B8FF",
          300: "#8C65F7",
          400: "#6F3FF5",
          500: "#5932C4",
        },
        teal: {
          100: "#E6FFF9",
          200: "#B3FFED",
          300: "#5BF1CD",
          400: "#02E2AC",
          500: "#11BC92",
        },
        pink: {
          100: "#FDDEE4",
          200: "#FAADBF",
          300: "#F579A6",
          400: "#F3587D",
          500: "#D03E63",
        },
        yellow: {
          100: "#FFF8DB",
          200: "#FFEEA8",
          300: "#FFDB4C",
          400: "#FFCC00",
          500: "#E1B815",
        },
        red: {
          100: "#D44D6E",
        },
        "gitcoin-violet": {
          100: "#F0EBFF",
          200: "#C9B8FF",
          300: "#8C65F7",
          400: "#6F3FF5",
          500: "#5932C4",
        },
      },
      keyframes: {
        violetTransition: {
          "5%": {
            "background-color": "#F0EBFF",
            color: "#6F3FF5",
          },
          "0%, 80%": {
            "background-color": "#6F3FF5",
            color: "#FFF",
          },
        },
        "pulse-scale": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(2)",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
  ],
};

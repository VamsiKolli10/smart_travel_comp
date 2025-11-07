/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        grotesk: [
          '"FKGroteskNeue"',
          '"Inter"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        teal: {
          50: "#f2fbfc",
          100: "#d4f2f5",
          200: "#a8e3ea",
          300: "#7cd3de",
          400: "#4dc0ce",
          500: "#21808d",
          600: "#1d7480",
          700: "#175e67",
          800: "#10464d",
          900: "#0b3238",
        },
        sand: {
          50: "#fcfcf9",
          100: "#f9f4e8",
          200: "#f3e7cf",
          300: "#e7d3a5",
          400: "#d9b36d",
          500: "#c48e3f",
          600: "#a66f2b",
          700: "#855322",
          800: "#63401e",
          900: "#4b3119",
        },
        slate: {
          900: "#0d1f24",
          800: "#112e35",
          700: "#13343b",
          600: "#1c4a53",
          500: "#2f6570",
          400: "#4c7f89",
          300: "#769fab",
          200: "#9ebbc2",
          100: "#c8d6da",
          50: "#edf2f3",
        },
      },
      boxShadow: {
        glow: "0 20px 50px -25px rgba(33, 128, 141, 0.45)",
        "glow-soft": "0 16px 40px -20px rgba(10, 22, 34, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
      maxWidth: {
        "8xl": "90rem",
      },
    },
  },
  plugins: [],
};

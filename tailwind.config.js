/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        pink: {
          100: "#FFF0F3",
          200: "#FFD6DE",
          300: "#FFB5C2",
          400: "#FF8FA3",
          500: "#FF6B81",
        },
        purple: {
          100: "#F3EEFF",
          200: "#E4D6FF",
          300: "#D4BBFF",
        },
        mint: {
          100: "#E8F8F0",
          200: "#B5EAD7",
          300: "#8DD9BE",
        },
        cream: {
          100: "#FFFCF0",
          200: "#FFF3B0",
        },
        warm: {
          50: "#FEFBF6",
          100: "#FFF8F0",
          200: "#FFE8D6",
        },
      },
    },
  },
  plugins: [],
};

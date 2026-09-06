/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        surfaceLight: "#F1F5F9",
        primary: "#D32F2F",
        primaryHover: "#B71C1C",
        secondary: "#0F3160",
        secondaryHover: "#0A244A",
        brandBlue: "#0F3160",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FAF7F2",
          surface: "#FFFFFF",
          primary: "#96613F",
          dark: "#4A3023",
          light: "#F3E8DC",
          border: "#E8DCD1",
          text: "#25211E",
          muted: "#77716B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        brand: {
          50: "#eef7ff", 100: "#d8ebff", 200: "#b6d9ff", 300: "#85c0ff",
          400: "#4a9dff", 500: "#1e80ff", 600: "#0d65db", 700: "#0c52b0",
          800: "#0d468f", 900: "#0e3b75"
        }
      }
    }
  },
  plugins: [],
};

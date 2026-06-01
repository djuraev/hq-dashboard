/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8eb6ff",
          400: "#598dff",
          500: "#3366ff",
          600: "#1f48f0",
          700: "#1838d4",
          800: "#1a31ab",
          900: "#1c3087",
        },
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#e1e5ec",
          300: "#cbd2dd",
          400: "#9aa4b5",
          500: "#6b7689",
          600: "#4d5667",
          700: "#3a4151",
          800: "#262c38",
          900: "#161a22",
        },
        good: "#16a34a",
        warn: "#d97706",
        bad: "#dc2626",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)",
        cardhover: "0 4px 12px rgba(16,24,40,.08), 0 2px 4px rgba(16,24,40,.06)",
        pop: "0 12px 32px rgba(16,24,40,.12)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

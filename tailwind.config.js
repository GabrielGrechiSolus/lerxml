/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007bff", // Azul institucional Solus
        secondary: "#0056b3",
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        card: "0 4px 8px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

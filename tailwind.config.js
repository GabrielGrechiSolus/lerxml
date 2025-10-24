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
        primary: {
          DEFAULT: '#0b2545', // deep navy
          light: '#1f3a66',
        },
        accent: '#2563eb', // blue-600
        muted: '#6b7280',
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        card: "0 4px 8px rgba(0, 0, 0, 0.08)",
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
    },
  },
  plugins: [],
};

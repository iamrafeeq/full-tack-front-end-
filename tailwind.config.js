/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans:  ['"DM Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

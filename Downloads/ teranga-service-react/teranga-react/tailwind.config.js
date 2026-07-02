/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B3A6B',
          dark: '#142d55',
          light: '#2A5298',
        },
        green: {
          teranga: '#3A9E3A',
          dark: '#2d8a2d',
          light: '#F0FDF4',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

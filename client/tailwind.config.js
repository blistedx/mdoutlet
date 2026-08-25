/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dairy: {
          green: '#1e3a1e',
          greenDark: '#142714',
          greenLight: '#2d4a2d',
          leaf: '#6a9c6a',
          leafLight: '#9bc09b',
          sage: '#4c7a4c',
          forest: '#3d6b3d',
          bg: '#f4f8f2',
          card: '#ffffff',
          cardAlt: '#f5faf5',
          cream: '#f8f5f0',
          tint: 'rgba(160, 195, 150, 0.20)',
          text: '#1e3a1e',
          textMuted: '#3f5a3f',
          blue: '#1e3a1e',
          darkBlue: '#142714',
          lightBlue: '#ebf5eb',
          cyan: '#6a9c6a',
          emerald: '#3d6b3d',
          amber: '#d97706',
          milk: '#ffffff',
          dark: '#142714'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(60, 80, 60, 0.06), 0 2px 6px rgba(60, 80, 60, 0.04)',
        'elevated': '0 30px 80px rgba(60, 80, 60, 0.12), 0 10px 30px rgba(60, 80, 60, 0.06)',
        'hero': '0 30px 80px rgba(60, 80, 60, 0.10), 0 10px 30px rgba(60, 80, 60, 0.05)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(60, 80, 60, 0.04)'
      }
    },

  },
  plugins: [],
}

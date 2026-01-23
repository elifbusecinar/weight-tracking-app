/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom color palette
        rose: {
          DEFAULT: '#cb748e',
          light: '#d698ab',
          lighter: '#eed4db',
        },
        sage: {
          DEFAULT: '#73986f',
          dark: '#426e55',
          darker: '#2d4839',
        },
        // Light mode colors
        light: {
          bg: '#eed4db',
          surface: '#ffffff',
          text: '#2d4839',
          muted: '#73986f',
        },
        // Dark mode colors
        dark: {
          bg: '#2d4839',
          surface: '#426e55',
          text: '#eed4db',
          muted: '#d698ab',
        },
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, #eed4db 0%, #d698ab 100%)',
        'gradient-dark': 'linear-gradient(135deg, #2d4839 0%, #426e55 100%)',
        'gradient-rose': 'linear-gradient(135deg, #cb748e 0%, #d698ab 100%)',
        'gradient-sage': 'linear-gradient(135deg, #73986f 0%, #426e55 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
}

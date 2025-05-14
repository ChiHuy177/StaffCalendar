// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'pulse': 'pulse 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(0, 202, 255, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(0, 202, 255, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0, 202, 255, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'custom': '0 4px 8px rgba(8, 59, 117, 0.1)',
        'custom-hover': '0 12px 24px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
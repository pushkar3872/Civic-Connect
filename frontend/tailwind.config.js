/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        civic: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a5f',
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        civic: {
          primary: '#1e40af',
          'primary-content': '#ffffff',
          secondary: '#0891b2',
          accent: '#f59e0b',
          neutral: '#1f2937',
          'base-100': '#f8fafc',
          'base-200': '#f1f5f9',
          'base-300': '#e2e8f0',
          info: '#3b82f6',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
    defaultTheme: 'civic',
  },
};

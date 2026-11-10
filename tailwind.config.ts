import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        canvas: '#FAFAFA',
        surface: '#FFFFFF',
        'surface-secondary': '#F1F1F0',
        content: {
          primary: '#37352F',
          secondary: '#787774',
          muted: '#9B9A97',
          inverted: '#FFFFFF',
        },
        brand: {
          primary: '#2383E2',
          hover: '#1A6FC4',
          subtle: '#E8F2FC',
        },
        semantic: {
          success: '#0F9D58',
          'success-subtle': '#E6F4EA',
          warning: '#F2994A',
          'warning-subtle': '#FDF2E9',
          danger: '#EB5757',
          'danger-subtle': '#FCE8E6',
          info: '#2F80ED',
          'info-subtle': '#E8F0FE',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;

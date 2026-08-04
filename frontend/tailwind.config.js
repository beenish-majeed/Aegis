/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg: 'var(--aegis-background)',
          surface: 'var(--aegis-surface)',
          primary: 'var(--aegis-primary)',
          'primary-hover': 'var(--aegis-primary-hover)',
          success: 'var(--aegis-success)',
          'success-bg': 'var(--aegis-success-bg)',
          warning: 'var(--aegis-warning)',
          'warning-bg': 'var(--aegis-warning-bg)',
          danger: 'var(--aegis-danger)',
          'danger-bg': 'var(--aegis-danger-bg)',
          text: 'var(--aegis-text)',
          muted: 'var(--aegis-muted)',
          border: 'var(--aegis-border)',
        },
      },
      borderRadius: {
        small: 'var(--aegis-radius-small)',
        medium: 'var(--aegis-radius-medium)',
        large: 'var(--aegis-radius-large)',
      },
      boxShadow: {
        card: 'var(--aegis-shadow-card)',
        floating: 'var(--aegis-shadow-floating)',
        modal: 'var(--aegis-shadow-modal)',
      },
      transitionDuration: {
        fast: 'var(--aegis-motion-fast)',
        normal: 'var(--aegis-motion-normal)',
        slow: 'var(--aegis-motion-slow)',
      },
    },
  },
  plugins: [],
};

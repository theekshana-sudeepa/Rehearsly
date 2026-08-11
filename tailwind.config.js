const tokens = require('./design-tokens');

/** @type {import('tailwindcss').Config} */
// Tokens live in design-tokens.js so that TypeScript code and Tailwind
// utilities can never drift apart. Edit them there, not here.
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: tokens.colors,
      fontSize: tokens.fontSize,
      borderRadius: tokens.borderRadius,
      spacing: tokens.spacing,
    },
  },
  plugins: [],
};

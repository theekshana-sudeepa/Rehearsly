/** @type {import('tailwindcss').Config} */
// Design tokens for Rehearsly.
// The palette is deliberately warm and paper-like rather than clinical blue/white —
// this is a confidence-building tool, not a medical product (see CLAUDE.md §2).
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Warm neutrals
        cream: '#FBF7F2',
        surface: '#FFFFFF',
        border: '#EBE2D8',
        ink: {
          DEFAULT: '#2A2320',
          muted: '#6B5F58',
          faint: '#9C8F86',
        },
        // Primary action — warm clay
        clay: {
          50: '#FAF0EB',
          100: '#F2DACF',
          300: '#DCA187',
          500: '#C2603C',
          600: '#A94F2E',
          700: '#8A3F24',
        },
        // Growth / success / positive feedback
        sage: {
          100: '#E2EDE5',
          500: '#5C8A6E',
          700: '#3F6650',
        },
        // Streaks and accents
        amber: {
          100: '#FBEFD5',
          500: '#D99A2B',
          700: '#A9741C',
        },
        // Destructive actions and the crisis-support surface
        rose: {
          100: '#F8E4E2',
          500: '#B4453F',
          700: '#8C332E',
        },
      },
      fontSize: {
        // Type scale: [size, lineHeight]
        caption: ['12px', '16px'],
        footnote: ['13px', '18px'],
        body: ['16px', '24px'],
        callout: ['18px', '26px'],
        title3: ['20px', '28px'],
        title2: ['24px', '32px'],
        title1: ['30px', '38px'],
        display: ['36px', '44px'],
      },
      borderRadius: {
        card: '16px',
        bubble: '20px',
        pill: '999px',
      },
      spacing: {
        gutter: '20px',
      },
    },
  },
  plugins: [],
};

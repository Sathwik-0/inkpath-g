import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#09090F',
          secondary: '#11111B',
          surface: '#131319',
          card: '#171725',
          elevated: '#202033',
        },
        manga: {
          violet: '#8B5CF6',
          violetGlow: 'rgba(139, 92, 246, 0.35)',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          accent: '#A78BFA',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHighlight: 'rgba(139, 92, 246, 0.3)',
        },
        text: {
          primary: '#F5F3FF',
          secondary: '#A1A1B5',
          muted: '#717184',
        },
        // Stitch Palette compatibility
        'primary-container': '#A078FF',
        'tertiary-container': '#009EB9',
        'surface-container': '#1F1F26',
        'surface-container-low': '#1B1B21',
        'surface-container-high': '#2A2930',
        'surface-container-highest': '#35343B',
        'surface-container-lowest': '#0E0E14',
        'on-surface': '#E4E1EA',
        'on-surface-variant': '#CBC3D7',
        'on-primary': '#3C0091',
        'secondary-container': '#3131C0',
        'on-secondary-container': '#B0B2FF',
        'error-container': '#93000A',
        error: '#FFB4AB',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mangaDialogue: ['Comic Neue', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;

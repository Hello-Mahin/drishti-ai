/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#0E9488',
          tealDark: '#0B7A70',
          tealLight: '#E6F4F2',
          coral: '#FF7A59',
          coralHover: '#E86646',
          coralLight: '#FFF0EC',
          bg: '#F7FAF9',
          dark: '#0B2A32',
          muted: '#527982',
          border: '#E1EBE8',
          card: '#FFFFFF',
        },
        stage: {
          nodr: '#16A34A',
          nodrBg: '#DCFCE7',
          mild: '#84CC16',
          mildBg: '#ECFCCB',
          moderate: '#F97316',
          moderateBg: '#FFEDD5',
          severe: '#EF4444',
          severeBg: '#FEE2E2',
          proliferative: '#991B1B',
          proliferativeBg: '#FEE2E2',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        panelEnter: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(-8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        backdropEnter: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        portalFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeUp: 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        scaleIn: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulseSubtle: 'pulseSubtle 2.5s infinite ease-in-out',
        floatSlow: 'floatSlow 6s infinite ease-in-out',
        panelEnter: 'panelEnter 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        backdropEnter: 'backdropEnter 0.2s ease-out forwards',
        portalFloat: 'portalFloat 4s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};

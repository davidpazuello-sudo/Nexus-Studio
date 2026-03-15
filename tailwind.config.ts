import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  // darkMode desabilitado — Nexus Studio usa APENAS modo claro
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Cor primária do Nexus Studio
        primary: {
          DEFAULT: '#1A6B35',
          foreground: '#FFFFFF',
          light: '#E8F5EE',
        },
        // Sidebar escura
        sidebar: {
          DEFAULT: '#1E2A3A',
          foreground: '#CBD5E1',
          border: '#2D3E52',
          active: {
            DEFAULT: '#1A6B35',
            foreground: '#FFFFFF',
            bg: '#E8F5EE',
          },
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      width: {
        sidebar: '220px',
      },
      boxShadow: {
        // Sombras leves conforme design system
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

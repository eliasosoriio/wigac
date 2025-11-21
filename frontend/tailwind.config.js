/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple-inspired color palette
        apple: {
          gray: {
            50: '#fafafa',
            100: '#f5f5f7',
            200: '#e8e8ed',
            300: '#d2d2d7',
            400: '#b0b0b8',
            500: '#86868b',
            600: '#6e6e73',
            700: '#515154',
            800: '#3a3a3c',
            900: '#1d1d1f',
          },
          blue: {
            50: '#e5f2ff',
            100: '#cce5ff',
            200: '#99cbff',
            300: '#66b0ff',
            400: '#3396ff',
            500: '#007aff',
            600: '#0062cc',
            700: '#004999',
            800: '#003166',
            900: '#001833',
          },
          green: {
            500: '#34c759',
            600: '#30b350',
          },
          red: {
            500: '#ff3b30',
            600: '#e63529',
          },
          orange: {
            500: '#E68325',
            600: '#cc7320',
          },
          yellow: {
            500: '#ffcc00',
            600: '#e6b800',
          },
          purple: {
            500: '#af52de',
            600: '#9d49c8',
          },
        },
        dark: {
          bg: '#191919',
          card: '#212121',
          border: '#2a2a2a',
          hover: '#252525',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
      },
      boxShadow: {
        'apple': '0 2px 10px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 4px 20px rgba(0, 0, 0, 0.12)',
        'apple-xl': '0 8px 30px rgba(0, 0, 0, 0.15)',
      },
      backdropBlur: {
        'apple': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                // Blue Neon theme — kanvas gelap + aksen neon
                night: {
                    950: '#060A12',
                    900: '#0A0E17',
                    800: '#0D1117',
                    700: '#131A28',
                    600: '#1B2436',
                    500: '#26324A',
                },
                neon: {
                    cyan: '#00F0FF',
                    blue: '#00D9FF',
                    azure: '#0066FF',
                    green: '#00FF9D',
                    yellow: '#FFE600',
                    red: '#FF3B5C',
                    purple: '#9D5CFF',
                },
            },
            fontFamily: {
                // Orbitron untuk heading futuristik, Rajdhani untuk body
                display: ['Orbitron', 'Rajdhani', ...defaultTheme.fontFamily.sans],
                sans: ['Rajdhani', 'Inter', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                'neon-sm': '0 0 8px rgba(0, 217, 255, 0.5)',
                neon: '0 0 16px rgba(0, 217, 255, 0.55), 0 0 4px rgba(0, 240, 255, 0.6)',
                'neon-lg': '0 0 28px rgba(0, 217, 255, 0.6), 0 0 8px rgba(0, 240, 255, 0.5)',
                'neon-green': '0 0 14px rgba(0, 255, 157, 0.55)',
                'neon-yellow': '0 0 14px rgba(255, 230, 0, 0.55)',
                'neon-red': '0 0 14px rgba(255, 59, 92, 0.55)',
            },
            animation: {
                'glow-pulse': 'glowPulse 2.2s ease-in-out infinite',
                'flicker': 'flicker 4s linear infinite',
            },
            keyframes: {
                glowPulse: {
                    '0%, 100%': {
                        boxShadow:
                            '0 0 10px rgba(0, 217, 255, 0.5), 0 0 4px rgba(0, 240, 255, 0.5)',
                    },
                    '50%': {
                        boxShadow:
                            '0 0 26px rgba(0, 217, 255, 0.85), 0 0 10px rgba(0, 240, 255, 0.7)',
                    },
                },
                flicker: {
                    '0%, 19%, 21%, 23%, 80%, 100%': { opacity: 1 },
                    '20%, 22%': { opacity: 0.5 },
                },
            },
            backgroundImage: {
                'neon-grid':
                    'linear-gradient(rgba(0, 217, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.05) 1px, transparent 1px)',
                'neon-radial':
                    'radial-gradient(circle at 50% 0%, rgba(0, 102, 255, 0.18), transparent 60%)',
            },
            backgroundSize: {
                grid: '48px 48px',
            },
        },
    },

    plugins: [forms],
};

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
                // Hardware Console: netral hangat + satu aksen. Nama token (night/neon) dipertahankan
                // supaya className lama tetap jalan; ganti nilainya saja.
                night: {
                    950: '#100E0A',
                    900: '#16140F',
                    800: '#1F1C16',
                    700: '#28241C',
                    600: '#3A352A',
                    500: '#4D4638',
                },
                neon: {
                    cyan: '#F0793A',   // aksen utama (teks/ikon/border)
                    blue: '#E8602C',   // aksen utama (tombol solid)
                    azure: '#C94A1E',  // aksen utama gelap (hover/scrollbar)
                    green: '#6FB592',  // tersedia / sukses
                    yellow: '#E3B34A', // pending / peringatan
                    red: '#D9604F',    // penuh / bahaya
                    purple: '#A59BC4', // netral-dingin, dipakai jarang
                },
            },
            fontFamily: {
                // Bricolage Grotesque untuk heading, IBM Plex Sans untuk body
                display: ['Bricolage Grotesque', ...defaultTheme.fontFamily.sans],
                sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                // nama lama dipertahankan; isinya kini bayangan solid ala tombol fisik
                'neon-sm': '2px 2px 0 #3A352A',
                neon: '4px 4px 0 #3A352A',
                'neon-lg': '6px 6px 0 #3A352A',
                'neon-green': '3px 3px 0 #2C4A3C',
                'neon-yellow': '3px 3px 0 #54431A',
                'neon-red': '3px 3px 0 #5A2A24',
            },
            animation: {
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
                'flicker': 'flicker 4s linear infinite',
            },
            keyframes: {
                glowPulse: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-1px)' },
                },
                flicker: {
                    '0%, 100%': { opacity: 1 },
                },
            },
            backgroundImage: {
                'neon-grid':
                    'linear-gradient(rgba(237, 230, 214, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(237, 230, 214, 0.03) 1px, transparent 1px)',
                'neon-radial':
                    'radial-gradient(circle at 50% 0%, rgba(232, 96, 44, 0.10), transparent 60%)',
            },
            backgroundSize: {
                grid: '48px 48px',
            },
        },
    },

    plugins: [forms],
};

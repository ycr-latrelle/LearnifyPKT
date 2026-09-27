/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                pixel: ['"Pixelify Sans"', 'cursive', 'sans-serif'],
                arcade: ['"Press Start 2P"', 'cursive'],
            },
            boxShadow: {
                'pixel-lg': '6px 6px 0px 0px #0F172A',
                'pixel-md': '4px 4px 0px 0px #0F172A',
                'pixel-sm': '2px 2px 0px 0px #0F172A',
            },
        },
    },
    plugins: [],
};
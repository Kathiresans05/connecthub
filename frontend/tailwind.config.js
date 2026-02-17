/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark theme colors matching reference design
                dark: {
                    bg: '#0F1419',
                    secondary: '#1A1F2E',
                    card: '#16202A',
                    border: '#2F3336',
                    hover: '#1D2432',
                },
                primary: {
                    DEFAULT: '#5B7FFF',
                    hover: '#4A6EEE',
                    light: '#7093FF',
                },
                accent: {
                    pink: '#FF4D6D',
                    blue: '#5B7FFF',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

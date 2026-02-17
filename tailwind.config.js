export default {
    content: ["./*.html", "./assets/**/*.{html,js}"],
    theme: {
        extend: {
            fontFamily: {
                almarai: ['"Almarai"', 'sans-serif'],
                inter: ['"Inter"', 'sans-serif'],
                poppins: ['"Poppins"', 'sans-serif'],
            },
            colors: {
                'purple-brand': '#240a37',
                'red-brand': '#ba112c',
                'gray-light': '#f2f2f2',
                'gray-dark': '#626262',
            },
        },
    },
    plugins: [],
};
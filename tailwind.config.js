/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
				serif: ["Merriweather", "ui-serif", "Georgia", "serif"],
			},
			colors: {
				brand: {
					DEFAULT: "#16a34a",
					dark: "#166534",
					light: "#4ade80",
				},
			},
			backgroundImage: {
				"hero-pattern": "linear-gradient(180deg, rgba(2,6,23,0.2), rgba(2,6,23,0.8))",
			},
		},
	},
	plugins: [],
};




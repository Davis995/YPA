import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	// Suppress React Router future warnings
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' }
	},
	server: {
		host: true, // allows access from network
		port: 5173, // your local dev port
		strictPort: true,
		allowedHosts: ['ea49ede4f60b.ngrok-free.app'], // allow your ngrok URL
		proxy: {
			'/api': {
				target: 'https://ypa-backend.onrender.com',
				changeOrigin: true,
				secure: false,
			},
			'/media': {
				target: 'https://ypa-backend.onrender.com',
				changeOrigin: true,
				secure: false,
			}
		}
	},
	define: {
		'import.meta.env.VITE_API_URL': JSON.stringify('https://ypa-backend.onrender.com')
	}
});




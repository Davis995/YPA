import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	  server: {
    host: true, // allows access from network
    port: 5173, // your local dev port
    strictPort: true,
    allowedHosts: ['ea49ede4f60b.ngrok-free.app'], // allow your ngrok URL
  },
});




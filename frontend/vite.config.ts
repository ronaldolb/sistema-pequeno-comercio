import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em dev, o Vite roda em outra porta que o Nest (3000); o proxy evita configurar CORS/URLs
// diferentes por ambiente — o frontend sempre chama "/api/...".
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

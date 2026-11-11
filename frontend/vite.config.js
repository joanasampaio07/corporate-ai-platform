import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Garante funcionamento em subdiretórios no GitHub Pages!
  server: {
    port: 3000,
  }
});


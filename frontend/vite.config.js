import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Configuración de Vite:
//  - En desarrollo (npm run dev) el servidor de Vite (puerto 5173) redirige
//    las peticiones /api al backend Express (puerto 4000).
//  - En producción (npm run build) se genera frontend/dist, que el propio
//    Express sirve en un único puerto.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base './': genera rutas RELATIVAS en dist/index.html (./assets/... en lugar
  // de /assets/...). Sin esto, la app publicada fuera de la raíz del servidor
  // no carga CSS/JS (error 404) — solo funcionaba en la vista previa.
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

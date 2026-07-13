import * as path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env / .env.local
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: parseInt(env.PORT) || 3004, // 👈 permanent port 3004
      host: '0.0.0.0',
      open: true, // auto-open browser
    },
    plugins: [react()],
    define: {
      // Vite only exposes variables prefixed with VITE_
      'process.env.VITE_AMIYO_API_KEY': JSON.stringify(env.VITE_AMIYO_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 👈 cleaner imports from src
      },
    },
  };
});

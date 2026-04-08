import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  // On Vercel, environment variables might be in process.env but not in .env files.
  // We prioritize 'VITE_' variants if available.
  const GEMINI_KEY = env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
  const NVIDIA_KEY = env.VITE_NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY || env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY || "";

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(GEMINI_KEY),
      'process.env.NVIDIA_API_KEY': JSON.stringify(NVIDIA_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-recharts': ['recharts'],
            'vendor-lucide': ['lucide-react'],
            'vendor-framework': ['react', 'react-dom'],
          },
        },
      },
    },
  };
});

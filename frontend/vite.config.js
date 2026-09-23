import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Only load variables starting with REACT_APP_ or VITE_
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_', 'VITE_']);
  
  const processEnv = {};
  for (const [key, val] of Object.entries(env)) {
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
      processEnv[`process.env.${key}`] = JSON.stringify(val);
    }
  }
  processEnv['process.env.NODE_ENV'] = JSON.stringify(mode);

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
    },
    define: {
      ...processEnv,
      'process.env': JSON.stringify(env),
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-jspdf': ['jspdf'],
          },
        },
      },
    },
  };
});

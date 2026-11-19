import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: true
  },

  build: {
    // Increase warning threshold (Three.js is big by design)
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // Split heavy libraries into separate cached chunks
        manualChunks: {
          // React core — tiny, changes rarely
          'vendor-react': ['react', 'react-dom'],
          // Three.js 3D engine — largest, cache separately
          'vendor-three': ['three'],
          // React Three Fiber + Drei helpers
          'vendor-r3f': ['@react-three/fiber', '@react-three/drei'],
          // GSAP animations
          'vendor-gsap': ['gsap', '@gsap/react'],
          // Socket.IO client
          'vendor-socket': ['socket.io-client'],
        }
      }
    }
  }
});

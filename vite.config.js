import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Three.js and related libraries (large bundle)
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // Animation libraries
          'animation-vendor': ['gsap', 'motion'],
          // Math library
          'math-vendor': ['maath'],
        },
      },
    },
    // Increase chunk size warning limit to 600KB (optional, but helps reduce warnings)
    chunkSizeWarningLimit: 600,
  },
})









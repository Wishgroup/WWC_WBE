import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    // Plugin to copy .htaccess after build
    {
      name: 'copy-htaccess',
      closeBundle() {
        const htaccessSource = join(process.cwd(), 'public', '.htaccess');
        const htaccessDest = join(process.cwd(), 'dist', '.htaccess');
        if (existsSync(htaccessSource)) {
          copyFileSync(htaccessSource, htaccessDest);
          console.log('✅ Copied .htaccess to dist/');
        }
      },
    },
  ],
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









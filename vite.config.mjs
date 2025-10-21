import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor_react'
            }
            if (id.includes('firebase')) {
              return 'vendor_firebase'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})

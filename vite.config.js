// CommonJS Vite config to avoid requiring ESM-only plugins in Node.
// We keep manualChunks and chunk size limit.
module.exports = {
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id && id.indexOf && id.indexOf('node_modules') !== -1) {
            if (id.indexOf('react') !== -1 || id.indexOf('react-dom') !== -1) {
              return 'vendor_react'
            }
            if (id.indexOf('firebase') !== -1) {
              return 'vendor_firebase'
            }
            return 'vendor'
          }
        }
      }
    }
  }
}

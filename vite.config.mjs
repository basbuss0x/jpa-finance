import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('xlsx-js-style')) return 'excel'
          return undefined
        },
      },
    },
  },
})

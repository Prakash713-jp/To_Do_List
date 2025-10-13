import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/To_Do_List/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1600, // raises warning threshold
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          calendar: ['@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/interaction'],
          bootstrap: ['react-bootstrap'],
        },
      },
    },
  },
})

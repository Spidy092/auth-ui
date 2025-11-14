import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'admin.local.test',   // 👈 change for each app
    port: 5173,                // or any port you want
    strictPort: true,
  },
});
 
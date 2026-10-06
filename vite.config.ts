import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { APP_NAME } from './src/config'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Keeps the display name in one place (src/config.ts).
      name: 'inject-app-name',
      transformIndexHtml: (html) => html.replaceAll('%APP_NAME%', APP_NAME),
    },
  ],
})

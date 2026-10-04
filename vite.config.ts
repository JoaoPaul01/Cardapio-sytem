import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // Para testar o PWA no modo de desenvolvimento
      },
      manifest: {
        name: 'Cardápio Churrascaria',
        short_name: 'Cardápio',
        description: 'Painel de controle do cardápio',
        theme_color: '#1e1e2d',
        background_color: '#f4f6f8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3135/3135695.png', // Ícone genérico provisório de comida
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3135/3135695.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});

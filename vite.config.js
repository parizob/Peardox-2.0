import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { seoPrerender } from './vite-plugins/seo-prerender.js'
import { spaFallback } from './vite-plugins/spa-fallback.js'

export default defineConfig({
  plugins: [
    react(),
    spaFallback(), // Handle SPA routing for /article/* routes
    seoPrerender({
      baseUrl: 'https://pearadox.app',
      generateSitemap: true
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react']
        }
      }
    }
  },
  // SEO optimizations
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
}) 
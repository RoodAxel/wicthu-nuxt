// https://nuxt.com/docs/api/configuration/nuxt-config
import { OFFLINE_SHELL_URL } from './shared/offline'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxtjs/seo',
    '@vite-pwa/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css', '~/assets/css/resource-list.css', '~/assets/css/investigateur-form.css'],

  // ── SEO (@nuxtjs/seo) ────────────────────────────────────────────────────
  site: {
    url: process.env.SITE_URL || 'http://localhost:3000',
    name: 'Wicthu',
    description: 'Compagnon de jeu pour L\'Appel de Cthulhu : créateur de fiches d\'investigateur, sorts, entités du Mythe, ouvrages occultes et ressources de jeu.',
    defaultLocale: 'fr'
  },

  runtimeConfig: {
    // Variables privées (server only)
    databaseUrl: process.env.DATABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SECRET_KEY,
    // Variables publiques
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      siteUrl: process.env.SITE_URL || 'http://localhost:3000'
    }
  },

  // Pages non indexables (robots.txt Disallow + <meta name="robots" noindex>)
  routeRules: {
    '/auth/**': { robots: false },
    '/profil': { robots: false },
    '/investigateur/creer': { robots: false },
    // Coquille SPA servie par le service worker quand le réseau est absent
    [OFFLINE_SHELL_URL]: { ssr: false, robots: false }
  },

  compatibilityDate: '2025-01-15',

  typescript: {
    strict: true
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // ── Hors ligne (PWA) ─────────────────────────────────────────────────────
  // Consultation des ressources sans réseau : app installable + service worker
  // (app/service-worker/sw.ts). Le cache se remplit via « Rendre disponible
  // hors ligne » (pied de page, cf. useOfflineCache).
  pwa: {
    strategies: 'injectManifest',
    srcDir: 'service-worker',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    manifest: {
      name: 'Wicthu — Compagnon de L\'Appel de Cthulhu',
      short_name: 'Wicthu',
      description: 'Sorts, entités du Mythe, ouvrages, occupations et ressources de jeu — consultables hors ligne.',
      lang: 'fr',
      start_url: '/',
      display: 'standalone',
      background_color: '#080a0c',
      theme_color: '#0d1117',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,woff2,woff,ttf,png,svg,ico}'],
      // Template PDF et polices de l'image OG : inutiles hors ligne
      globIgnores: ['**/*.pdf', '_og-static-fonts/**'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      // Révision = date du build : la coquille est rafraîchie à chaque déploiement
      additionalManifestEntries: [{ url: OFFLINE_SHELL_URL, revision: Date.now().toString() }]
    },
    client: {
      installPrompt: false
    },
    devOptions: {
      enabled: false
    }
  },

  sitemap: {
    // Pages privées / derrière authentification : hors sitemap
    exclude: ['/auth/**', '/profil', '/investigateur/creer', OFFLINE_SHELL_URL]
  },

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm'
    }
  }
})

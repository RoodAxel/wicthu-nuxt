// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxtjs/seo'
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
    '/investigateur/creer': { robots: false }
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

  sitemap: {
    // Pages privées / derrière authentification : hors sitemap
    exclude: ['/auth/**', '/profil', '/investigateur/creer']
  },

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm'
    }
  }
})

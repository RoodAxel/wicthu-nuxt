// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      passwordReset: '/auth/reset-password'
    }
  },

  runtimeConfig: {
    // Variables privées (server only)
    databaseUrl: process.env.DATABASE_URL,
    pdfcoApiKey: process.env.PDFCO_API_KEY,
    supabaseServiceKey: process.env.SUPABASE_SECRET_KEY,
    // Variables publiques
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      siteUrl: process.env.SITE_URL || 'http://localhost:3000'
    }
  },

  typescript: {
    strict: true
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  nitro: {
    serverAssets: [{ baseName: 'pdfs', dir: './server/assets/pdfs' }]
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})

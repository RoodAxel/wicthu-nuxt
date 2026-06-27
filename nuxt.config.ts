// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css', '~/assets/css/resource-list.css', '~/assets/css/investigateur-form.css'],

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

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm'
    }
  }
})

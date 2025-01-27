// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  plugins: [
    '~/plugins/auth'
  ],
  css: [
    '~/assets/css/main.css',
  ],
  app: {
    head: {
      title: 'AGI Hunt',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AGI Hunt - Discover AI, Web3, XR and Robot insights from top influencers' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      script: [
        { 
          src: 'https://platform.twitter.com/widgets.js',
          async: true,
          defer: true,
          crossorigin: 'anonymous',
          onerror: 'this.onerror=null;console.log("Twitter widgets failed to load");'
        }
      ]
    },
    pageTransition: { name: 'none' },
    layoutTransition: { name: 'none' }
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    }
  },
  nitro: {
    static: {
      directory: 'public'
    }
  }
})

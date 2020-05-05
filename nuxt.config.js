const isProd = process.env.NODE_ENV === 'production'

const app = {
  name: 'Rent a Body',
  description: 'Travel anywhere from your home',
  social: {
    twitter: '',
    instagram: 'rent.a.body',
    facebook: '',
    slack: ''
  },
  nav: [],
  url: 'https://rent-a-body.netlify.app/',
  cover: '/cover/wide.png'
}

export default {
  mode: 'spa',
  /*
   ** Headers of the page
   */
  head: {
    title: app.name,
    bodyAttrs: {
      class: 'bg-primary-light'
    },
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#2a1b3c' },
  /*
   ** Global CSS
   */
  css: ['@/assets/css/typography.css', '@/assets/css/vendors.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/composition-api',
    '~/plugins/firebase',
    '~/plugins/router',
    '~/plugins/directives'
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    '@nuxtjs/sentry',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'portal-vue/nuxt',
    '@nuxtjs/device',
    'nuxt-i18n'
  ],
  purgeCSS: {
    enabled: false
  },
  pwa: {
    workbox: {
      offline: true,
      dev: false,
      pagesURLPattern: '/.*'
    },
    meta: {
      name: app.name,
      description: app.description,
      ogHost: app.url,
      ogImage: app.cover,
      nativeUI: true,
      twitterSite: '@' + app.social.twitter
    },
    manifest: {
      name: app.name,
      short_name: app.name,
      start_url: '/app/?standalone=true',
      background_color: '#ece3f7',
      lang: 'en'
    }
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      config.resolve.alias.vue = 'vue/dist/vue.common'

      const svgRule = config.module.rules.find((rule) => rule.test.test('.svg'))

      svgRule.test = /\.(png|jpe?g|gif|webp)$/

      config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true
            }
          }
        ]
      })

      config.module.rules.push({
        test: /\.yml$/,
        use: 'js-yaml-loader'
      })
    }
  },
  generate: {
    routes: ['/', '/signup/', '/mafia/', '/salsa/', '/schedule/']
  },
  env: {
    firebase: {
      config: {
        apiKey: 'AIzaSyAbf3mXzqdiQec4a50OpIt2s15r18c4Dvc',
        authDomain: 'rent-a-body.firebaseapp.com',
        databaseURL: 'https://rent-a-body.firebaseio.com',
        projectId: 'rent-a-body',
        storageBucket: 'rent-a-body.appspot.com',
        messagingSenderId: '1039826506507',
        appId: '1:1039826506507:web:c5f3a46b35978a0dfb480e',
        measurementId: 'G-1V4YW98E42'
      },
      services: {
        auth: true,
        firestore: true,
        analytics: true
      }
    }
  },
  sentry: {
    disabled: !isProd,
    dsn:
      'https://be38de68343643c785d55fcbabeee183@o340470.ingest.sentry.io/5224559'
  },
  robots: [
    {
      UserAgent: '*',
      Allow: '/'
    },
    {
      UserAgent: '*',
      Disallow: '/app'
    }
  ],
  sitemap: {
    hostname: app.url,
    routes: ['/']
  }
}

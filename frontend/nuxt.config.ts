// https://nuxt.com/docs/api/configuration/nuxt-config

import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "src/",

  site: {
    name: "Maidstone Canoe Club",
    url: process.env.BASE_URL,
    description: "Kayak, Canoe and SUP Club in Maidstone, Kent, UK"
  },

  runtimeConfig: {
    public: {
      BASE_URL: process.env.BASE_URL,
      ENV: process.env.NODE_ENV ?? "production",
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT
      }
    }
  },

  sourcemap: {
    server: true,
    client: true
  },

  app: {
    head: {
      charset: "utf-8",
      htmlAttrs: {
        lang: "en"
      },
      meta: [
        { name: "og:title", content: "Maidstone Canoe Club" },
        { name: "og:description", content: "Kayak, Canoe and SUP Club in Maidstone, Kent, UK" },
        { name: "og:type", content: "website" },
        { name: "og:site_name", content: "Maidstone Canoe Club" },
        { name: "apple-mobile-web-app-title", content: "Maidstone Canoe Club" },
        { name: "application-name", content: "Maidstone Canoe Club" },
        { name: "msapplication-TileColor", content: "#cbeeff" },
        { name: "theme-color", content: "#cdeeff" }
      ],
      link: [
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#40a7e0" }
      ]
    },
    pageTransition: {
      name: "page",
      mode: "out-in"
    },
    layoutTransition: {
      name: "layout",
      mode: "out-in"
    }
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false
    }
  ],

  extends: [
    "nuxt-umami"
  ],

  routeRules: {
    "/**": {
      headers: {
        "Document-Policy": "js-profiling"
      }
    }
  },

  modules: [
    "nuxt-directus",
    "nuxt-headlessui",
    "@pinia/nuxt",
    "@nuxtjs/turnstile",
    "floating-vue/nuxt",
    "nuxt-og-image",
    "nuxt-time",
    "@nuxt/fonts",
    "@nuxtjs/device",
    "@nuxt/image",
    "@nuxt/test-utils/module",
    "@nuxt/ui",
    "@sentry/nuxt/module"
  ],

  image: {
    directus: {
      // This URL needs to include the final `assets/` directory
      baseURL: `${process.env.NUXT_PUBLIC_DIRECTUS_URL}/assets/`
    }
  },

  headlessui: {
    prefix: ""
  },

  colorMode: {
    preference: 'light'
  },

  directus: {
    url: "http://host.docker.internal:8055",
    autoRefresh: true,
    fetchUserParams: {
      fields: ["*", "role.name"]
    }
    // onAutoRefreshFailure () : Promise<void> {
    //   console.log("AUTO REFRESH FAILURE!");
    //   return Promise.resolve();
    // }
  },

  ogImage: {
    fonts: [
      "Karla:700", "Space+Grotesk:700"
    ],
    compatibility: {
      prerender: {
        chromium: false
      }
    }
  },

  nitro: {
    publicAssets: process.env.NODE_ENV === "production"
      ? [
        {
          baseURL: "images",
          dir: "public/images",
          maxAge: 31622400
        }
      ]
      : []
  },

  vite: {
    optimizeDeps: {
      include: [
        "lodash-es",
        // workaround for optimized dependencies changes messages
        // see https://github.com/nuxt/nuxt/issues/26783
        "@unhead/vue",
        "dinero.js",
        "@vuelidate/validators",
        "@vuelidate/core",
        "rrule",
        "nanoid",
        "@vuepic/vue-datepicker",
        "@heroicons/vue/16/solid",
        "@vueup/vue-quill",
        "@zxcvbn-ts/core",
        "@zxcvbn-ts/language-common",
        "vue-qrcode-reader",
        "@vueuse/core",
        "qrcode.vue",
        "date-fns-tz"
      ]
    },
    build: {
      sourcemap: true
    },
    // plugins: [
      // sentryVitePlugin({
      //   authToken: process.env.SENTRY_AUTH_TOKEN,
      //   org: process.env.SENTRY_ORG,
      //   project: process.env.SENTRY_PROJECT,
      //   telemetry: false,
      //   disable: process.env.NODE_ENV !== "production",
      //   release: {
      //     name: process.env.SENTRY_RELEASE
      //   },
      //   debug: true
      // })
    // ],
    server: {
      watch: {
        usePolling: true,
        interval: 1000
      }
    }
  }
});

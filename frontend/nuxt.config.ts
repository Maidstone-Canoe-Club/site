// https://nuxt.com/docs/api/configuration/nuxt-config

import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "src/",

  site: {
    url: process.env.BASE_URL
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

  appConfig: {
    umami: {
      version: 2
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
        { name: "description", content: "Maidstone Canoe Club - Kayak, Canoe and SUP Club in Maidstone, Kent, UK" },
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

  modules: [
    "nuxt-directus",
    "@nuxtjs/tailwindcss",
    "nuxt-headlessui",
    "@pinia/nuxt",
    "@nuxtjs/turnstile",
    "floating-vue/nuxt",
    "nuxt-og-image",
    "@nuxt/fonts",
    "@nuxtjs/device"
  ],

  headlessui: {
    prefix: ""
  },

  directus: {
    url: "http://host.docker.internal:8055",
    autoRefresh: true,
    fetchUserParams: {
      fields: ["*", "role.name"]
    },
    onAutoRefreshFailure () : Promise<void> {
      console.log("AUTO REFRESH FAILURE!");
      return Promise.resolve();
    }
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
    publicAssets: [
      {
        baseURL: "images",
        dir: "public/images",
        maxAge: 31622400
      }
    ]
  },

  vite: {
    build: {
      sourcemap: true
    },
    plugins: [
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        telemetry: false,
        disable: process.env.NODE_ENV !== "production",
        release: {
          name: process.env.SENTRY_RELEASE
        },
        debug: true
      })
    ],
    server: {
      watch: {
        usePolling: true,
        interval: 1000
      }
    }
  }
});

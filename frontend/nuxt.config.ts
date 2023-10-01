// https://nuxt.com/docs/api/configuration/nuxt-config

import { sentryVitePlugin } from "@sentry/vite-plugin";

function scripts () {
  const result = [];

  if (process.env.NUXT_PUBLIC_UMAMI_HOST && process.env.NUXT_PUBLIC_UMAMI_ID) {
    result.push({
      src: `${process.env.NUXT_PUBLIC_UMAMI_HOST}/script.js`,
      async: true,
      "data-website-id": process.env.NUXT_PUBLIC_UMAMI_ID
    });
  }

  return result;
}

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "src/",

  runtimeConfig: {
    public: {
      BASE_URL: process.env.BASE_URL,
      ENV: process.env.NODE_ENV ?? "production",
      SENTRY_ENABLED: (process.env.NODE_ENV ?? "production") === "production",
      SENTRY_DSN: process.env.SENTRY_DSN,
      SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
      SENTRY_RELEASE: process.env.SENTRY_RELEASE
    }
  },

  sourcemap: {
    server: true,
    client: true
  },

  app: {
    head: {
      charset: "utf-8",
      script: scripts(),
      htmlAttrs: {
        lang: "en"
      },
      meta: [
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
    }
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false
    }
  ],

  modules: [
    "nuxt-directus",
    "@nuxtjs/google-fonts",
    "@nuxtjs/tailwindcss",
    "nuxt-headlessui",
    "@pinia/nuxt",
    "@nuxt/image",
    "@nuxtjs/turnstile"
  ],

  directus: {
    autoRefresh: true,
    fetchUserParams: {
      fields: ["*", "role.name"]
    },
    onAutoRefreshFailure () : Promise<void> {
      console.log("AUTO REFRESH FAILURE!");
      return Promise.resolve();
    }
  },

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700]
    }
  },

  image: {
    ipx: {
      options: {
        maxAge: 31536000
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
  },

  css: [
    "~/assets/main.css"
  ]
});

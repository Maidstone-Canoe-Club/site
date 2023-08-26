// https://nuxt.com/docs/api/configuration/nuxt-config

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

  app: {
    head: {
      script: scripts(),
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
    "@nuxtjs/tailwindcss",
    "nuxt-headlessui"
  ],

  directus: {
    autoRefresh: true
  },

  vite: {
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

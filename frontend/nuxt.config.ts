// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "src/",

  app: {
    head: {
      title: "Maidstone Canoe Club",
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

  modules: ["nuxt-directus"],

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
  }
});

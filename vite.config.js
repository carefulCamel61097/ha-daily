import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/ha-daily/",
  server: {
    host: "0.0.0.0",
    // This allows the Replit preview to work
    allowedHosts: process.env.REPLIT_DOMAINS
      ? process.env.REPLIT_DOMAINS.split(",")
      : [],
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        // include the self-hosted fonts so the app renders correctly offline
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        // Cache audio on demand (CacheFirst) with automatic expiry, instead of
        // a hand-rolled daily flush. Files are stored as they're fetched/played.
        runtimeCaching: [
          {
            urlPattern: /\/audio\/.*\.mp3$/,
            handler: "CacheFirst",
            options: {
              cacheName: "ha-daily-audio",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: "Ha-Daily Thai",
        short_name: "HaDaily",
        description: "Learn 5 Thai words a day",
        theme_color: "#0B1221",
        background_color: "#0B1221",
        display: "standalone",
        icons: [
          {
            src: "icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});

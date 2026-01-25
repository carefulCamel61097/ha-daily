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

import { fileURLToPath, URL } from "url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default ({ mode }) => {
  // https://vitejs.dev/config/#environment-variables
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        // Fix for web3.js import
        process: "process/browser",
        stream: "stream-browserify",
        zlib: "browserify-zlib",
        util: "util",
      },
    },
    optimizeDeps: {
      exclude: ["electron-fetch", "electron"], // Fix for lsp-factory.js
    },
    // Change base URL in .env file (for production)
    base: process.env.VITE_APP_BASEURL,
  });
};

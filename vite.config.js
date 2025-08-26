import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [preact(), tailwindcss()],
});

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: "esm",
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  env: {
    NODE_ENV: "production",
  },
});

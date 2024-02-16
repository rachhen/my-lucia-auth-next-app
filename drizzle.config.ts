import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  driver: "better-sqlite",
  out: "./drizzle",
  breakpoints: true,
  verbose: true,
  strict: true,
});

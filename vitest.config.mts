import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests only: pure modules under src/lib and src/data. Anything that
// touches Prisma, Stripe or Next request scope is out of scope here and is
// exercised on the Vercel preview instead (see HANDOVER.md, "Превью как
// песочница").
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./src/test/server-only.ts", import.meta.url)),
    },
  },
});

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// We deliberately cache the PrismaClient on globalThis in production too —
// each cold-start lambda would otherwise spin up a fresh Neon WS pool, and
// under burst load that leaks connections until the lambda freezes. Vercel's
// per-instance global is reused across handler invocations within the same
// container, which is exactly the lifetime we want.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = createClient();
  globalForPrisma.prisma = client;
  return client;
}

// Proxy defers construction to first property access. Importing this module
// never throws — so `next build`'s "collect page data" phase (which evaluates
// route modules without a full env) succeeds even when DATABASE_URL is unset.
// Runtime calls still fail fast if the env var is genuinely missing.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_t, prop, receiver) {
    const client = getClient() as unknown as object;
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

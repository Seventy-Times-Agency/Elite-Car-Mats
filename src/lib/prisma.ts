import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";
import ws from "ws";
import { ensureSchema } from "./db-setup";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Fire the idempotent schema sync as soon as prisma is imported on any
// cold start. Non-blocking — most queries don't touch the new shape, so
// we don't want to add latency to every first request. The cached
// one-shot in db-setup makes sure it only runs once per process.
if (typeof process !== "undefined" && process.env.DATABASE_URL) {
  ensureSchema().catch(() => {});
}

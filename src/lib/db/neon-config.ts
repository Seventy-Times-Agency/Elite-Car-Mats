import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

/**
 * One place for the Neon driver setup shared by the Prisma client and the
 * DDL bootstrap. `DATABASE_WS_PROXY` (dev only, never set on Vercel)
 * points the driver at a plain WebSocket→TCP proxy so a local Postgres
 * such as PGlite can stand in for Neon; without it the driver uses Neon's
 * own secure endpoint.
 */
export function configureNeon(): void {
  neonConfig.webSocketConstructor = ws;
  const proxy = process.env.DATABASE_WS_PROXY;
  if (proxy && process.env.NODE_ENV !== "production") {
    neonConfig.wsProxy = () => proxy;
    neonConfig.useSecureWebSocket = false;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;
  }
}

import type { Instrumentation } from "next";

/**
 * Uncaught server errors (a page or route that threw past its own
 * try/catch) go to the problem journal. Money paths are critical — the
 * owner gets an email — everything else is a warning line in the admin.
 */
const CRITICAL_PATHS = ["/api/orders", "/api/checkout", "/api/webhooks", "/checkout"];

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  // The journal talks to Redis over fetch and imports server-only email
  // code — Node runtime only; the proxy (edge) just keeps its log line.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const path = request.path.split("?")[0];
  const { reportProblem } = await import("@/lib/ops/journal");
  await reportProblem({
    area: "request.error",
    severity: CRITICAL_PATHS.some((p) => path.startsWith(p)) ? "critical" : "warning",
    error: err,
    context: `${request.method} ${context.routePath}`,
  });
};

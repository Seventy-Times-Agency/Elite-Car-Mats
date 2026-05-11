import "server-only";

/**
 * Public surface of the ShipStation integration. Import from here, not
 * from the individual files — that lets us refactor internals without
 * touching call sites.
 */

export { isShipstationConfigured } from "../config";
export { pushOrderToShipstation } from "./create-order";
export type { PushResult, PushSkipReason } from "./create-order";
export { handleShipNotifyResource } from "./handle-ship-notify";
export { verifyShipstationWebhookRequest } from "./webhook-verify";
export type { SsWebhookEnvelope } from "./types";

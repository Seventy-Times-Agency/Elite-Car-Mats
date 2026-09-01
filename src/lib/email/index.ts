/**
 * Transactional email surface. The Resend transport lives in `transport.ts`;
 * each customer-facing message has its own template module under
 * `templates/`. Add a new email by dropping a file into `templates/` and
 * re-exporting its `send*` function from here.
 */

export { sendCustomerOrderEmail } from "./templates/order-customer";
export { sendOwnerOrderEmail } from "./templates/order-owner";
export { sendContactEmail } from "./templates/contact";
export { sendShippedEmail } from "./templates/shipped";
export { sendReviewInviteEmail } from "./templates/review-invite";
export { sendReviewThanksEmail } from "./templates/review-thanks";
export { sendCustomInvoiceEmail } from "./templates/custom-invoice";
export { sendAbandonedCheckoutEmail } from "./templates/abandoned-checkout";
export type { OrderEmailItem, OrderEmailData } from "./templates/base";

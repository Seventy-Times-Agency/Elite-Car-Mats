import "server-only";

/**
 * Minimal subset of the ShipStation V1 REST API we actually use. The full
 * surface is documented at https://www.shipstation.com/docs/api/ — keep
 * additions here intentional, don't mirror their entire schema.
 */

export interface SsAddress {
  name: string;
  company?: string | null;
  street1: string;
  street2?: string | null;
  street3?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2, e.g. "US"
  phone?: string | null;
  residential?: boolean | null;
}

export interface SsWeight {
  value: number;
  units: "grams" | "ounces" | "pounds";
}

export interface SsOrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  weight: SsWeight;
}

export type SsOrderStatus =
  | "awaiting_payment"
  | "awaiting_shipment"
  | "shipped"
  | "on_hold"
  | "cancelled";

export interface SsCreateOrderRequest {
  orderNumber: string;
  orderKey: string;
  orderDate: string; // ISO
  paymentDate?: string | null;
  orderStatus: SsOrderStatus;
  customerUsername?: string | null;
  customerEmail: string;
  billTo: SsAddress;
  shipTo: SsAddress;
  items: SsOrderItem[];
  amountPaid: number;
  shippingAmount?: number;
  internalNotes?: string | null;
  customerNotes?: string | null;
  weight: SsWeight;
  storeId?: number;
}

export interface SsCreateOrderResponse {
  orderId: number;
  orderNumber: string;
  orderKey: string;
  orderStatus: SsOrderStatus;
}

/**
 * What ShipStation POSTs to our webhook URL when a shipment notification
 * fires. Note: the payload itself does NOT contain shipment data — it
 * contains a resource_url we must fetch with our API credentials.
 *
 * https://www.shipstation.com/docs/api/webhooks/
 */
export interface SsWebhookEnvelope {
  resource_url: string;
  resource_type:
    | "ORDER_NOTIFY"
    | "ITEM_ORDER_NOTIFY"
    | "SHIP_NOTIFY"
    | "ITEM_SHIP_NOTIFY";
}

export interface SsShipment {
  shipmentId: number;
  orderId: number;
  orderKey: string;
  orderNumber: string;
  createDate: string;
  shipDate: string;
  trackingNumber: string;
  carrierCode: string;
  serviceCode: string | null;
  packageCode: string | null;
  voided: boolean;
  marketplaceNotified: boolean;
}

export interface SsShipmentList {
  shipments: SsShipment[];
  total: number;
  page: number;
  pages: number;
}

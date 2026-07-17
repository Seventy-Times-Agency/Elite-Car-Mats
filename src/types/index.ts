export type VehicleCategory = "car" | "suv" | "minivan" | "truck" | "commercial";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  modelsCount: number;
  /**
   * US-market popularity rank — lower = more popular. Hydrated from
   * `BRAND_POPULARITY` in `data/catalog/brands.ts`. Brands without an
   * explicit rank fall back to 999 so they sort to the end.
   */
  popularity?: number;
  /**
   * Distinct VehicleCategory values present across this brand's models.
   * Hydrated in `data/catalog/index.ts`. Used by the catalog body-type
   * filter to hide brands that don't have any matching models.
   */
  categories?: VehicleCategory[];
}

export interface CarModel {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  slug: string;
  years: number[];
  bodyType: string;
  category: VehicleCategory;
  image?: string;
}

export type MatSetType = "front" | "full" | "cargo" | "full-cargo";

export interface MatSet {
  type: MatSetType;
  label: string;
  description: string;
  price?: number;
}

export interface EvaColor {
  id: string;
  name: string;
  hex: string;
  image?: string;
}

export interface EdgeColor {
  id: string;
  name: string;
  hex: string;
}

export interface Badge {
  id: string;
  brandName: string;
  image?: string;
  price?: number;
}

export interface Product {
  id: string;
  model: CarModel;
  matSet: MatSetType;
  color: EvaColor;
  edgeColor: EdgeColor;
  badge?: Badge;
  price?: number;
}

export interface CartItem {
  id: string;
  modelId: string;
  brandName: string;
  modelName: string;
  year: number;
  matSet: MatSetType;
  matSetLabel: string;
  color: EvaColor;
  edgeColor: EdgeColor;
  badge?: Badge;
  /**
   * How many brand-logo plates (one per mat, cargo included). Only
   * meaningful when `badge` is set; legacy carts without the field
   * mean 1.
   */
  badgeCount?: number;
  /** Aluminum heel pad add-on (+$17). */
  heelPad?: boolean;
  /**
   * Third-row mats add-on — for 7-seat trims of standard-profile
   * SUVs/crossovers the catalog can't distinguish from 5-seaters.
   */
  thirdRow?: boolean;
  /**
   * Optional trim/floor-configuration note from the customer (hybrid,
   * AWD, 2nd-row captain chairs vs bench...) — one model can have
   * different floor pans per configuration, and the workshop needs
   * this to pick the right cut pattern. Free text, joined into the
   * order comment at checkout.
   */
  configNote?: string;
  quantity: number;
  price?: number;
}

export interface Review {
  id: string;
  customerName: string;
  carModel: string;
  text: string;
  rating: number;
  photos?: string[];
  createdAt: string;
}

export interface OrderStatus {
  id: string;
  status: "pending" | "production" | "shipped" | "delivered";
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

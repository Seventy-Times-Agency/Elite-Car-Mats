export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  modelsCount: number;
}

export type VehicleCategory = "car" | "suv" | "truck";

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

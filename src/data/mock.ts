import { Brand, CarModel, EvaColor, EdgeColor, MatSet, Review, Badge } from "@/types";

export const matSets: MatSet[] = [
  {
    type: "front",
    label: "Передние",
    description: "Коврики для водителя и переднего пассажира",
  },
  {
    type: "full",
    label: "Полный комплект",
    description: "Коврики для всего салона",
  },
  {
    type: "cargo",
    label: "Багажник",
    description: "Коврик в багажное отделение",
  },
  {
    type: "full-cargo",
    label: "Полный + Багажник",
    description: "Коврики для салона и багажника",
  },
];

export const evaColors: EvaColor[] = [
  { id: "black", name: "Чёрный", hex: "#1A1A1A" },
  { id: "gray", name: "Серый", hex: "#6B7280" },
];

export const edgeColors: EdgeColor[] = [
  { id: "black", name: "Чёрный", hex: "#1A1A1A" },
  { id: "gray", name: "Серый", hex: "#6B7280" },
  { id: "gold", name: "Золотой", hex: "#D4A843" },
  { id: "red", name: "Красный", hex: "#DC2626" },
];

export const brands: Brand[] = [
  { id: "toyota", name: "Toyota", slug: "toyota", modelsCount: 25 },
  { id: "bmw", name: "BMW", slug: "bmw", modelsCount: 20 },
  { id: "mercedes", name: "Mercedes-Benz", slug: "mercedes", modelsCount: 22 },
  { id: "lexus", name: "Lexus", slug: "lexus", modelsCount: 15 },
  { id: "honda", name: "Honda", slug: "honda", modelsCount: 18 },
  { id: "audi", name: "Audi", slug: "audi", modelsCount: 16 },
  { id: "nissan", name: "Nissan", slug: "nissan", modelsCount: 20 },
  { id: "ford", name: "Ford", slug: "ford", modelsCount: 15 },
  { id: "volkswagen", name: "Volkswagen", slug: "volkswagen", modelsCount: 14 },
  { id: "hyundai", name: "Hyundai", slug: "hyundai", modelsCount: 12 },
  { id: "kia", name: "Kia", slug: "kia", modelsCount: 12 },
  { id: "tesla", name: "Tesla", slug: "tesla", modelsCount: 5 },
  { id: "mazda", name: "Mazda", slug: "mazda", modelsCount: 10 },
  { id: "subaru", name: "Subaru", slug: "subaru", modelsCount: 8 },
  { id: "volvo", name: "Volvo", slug: "volvo", modelsCount: 10 },
  { id: "jeep", name: "Jeep", slug: "jeep", modelsCount: 8 },
  { id: "dodge", name: "Dodge", slug: "dodge", modelsCount: 6 },
  { id: "chevrolet", name: "Chevrolet", slug: "chevrolet", modelsCount: 15 },
  { id: "cadillac", name: "Cadillac", slug: "cadillac", modelsCount: 8 },
  { id: "chrysler", name: "Chrysler", slug: "chrysler", modelsCount: 5 },
  { id: "gmc", name: "GMC", slug: "gmc", modelsCount: 7 },
  { id: "infiniti", name: "Infiniti", slug: "infiniti", modelsCount: 8 },
  { id: "acura", name: "Acura", slug: "acura", modelsCount: 7 },
  { id: "porsche", name: "Porsche", slug: "porsche", modelsCount: 8 },
  { id: "mitsubishi", name: "Mitsubishi", slug: "mitsubishi", modelsCount: 6 },
];

export const mockModels: CarModel[] = [
  {
    id: "camry",
    brandId: "toyota",
    brandName: "Toyota",
    name: "Camry",
    slug: "camry",
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    bodyType: "Седан",
  },
  {
    id: "rav4",
    brandId: "toyota",
    brandName: "Toyota",
    name: "RAV4",
    slug: "rav4",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    bodyType: "Кроссовер",
  },
  {
    id: "3-series",
    brandId: "bmw",
    brandName: "BMW",
    name: "3 Series",
    slug: "3-series",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    bodyType: "Седан",
  },
  {
    id: "x5",
    brandId: "bmw",
    brandName: "BMW",
    name: "X5",
    slug: "x5",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    bodyType: "Кроссовер",
  },
  {
    id: "c-class",
    brandId: "mercedes",
    brandName: "Mercedes-Benz",
    name: "C-Class",
    slug: "c-class",
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    bodyType: "Седан",
  },
  {
    id: "model-3",
    brandId: "tesla",
    brandName: "Tesla",
    name: "Model 3",
    slug: "model-3",
    years: [2020, 2021, 2022, 2023, 2024],
    bodyType: "Седан",
  },
  {
    id: "model-y",
    brandId: "tesla",
    brandName: "Tesla",
    name: "Model Y",
    slug: "model-y",
    years: [2021, 2022, 2023, 2024],
    bodyType: "Кроссовер",
  },
];

export const badges: Badge[] = [
  { id: "toyota", brandName: "Toyota" },
  { id: "bmw", brandName: "BMW" },
  { id: "mercedes", brandName: "Mercedes-Benz" },
  { id: "lexus", brandName: "Lexus" },
  { id: "honda", brandName: "Honda" },
  { id: "audi", brandName: "Audi" },
  { id: "nissan", brandName: "Nissan" },
  { id: "tesla", brandName: "Tesla" },
  { id: "ford", brandName: "Ford" },
  { id: "porsche", brandName: "Porsche" },
];

export const mockReviews: Review[] = [
  {
    id: "1",
    customerName: "Александр М.",
    carModel: "Toyota Camry 2022",
    text: "Отличные коврики! Встали идеально, как родные. Качество EVA на высоте — не скользят, легко моются. Рекомендую!",
    rating: 5,
    createdAt: "2026-03-15",
  },
  {
    id: "2",
    customerName: "Ирина К.",
    carModel: "BMW X5 2023",
    text: "Заказала полный комплект с багажником. Коврики пришли быстро, упаковка надёжная. Смотрятся премиально, золотая окантовка шикарна.",
    rating: 5,
    createdAt: "2026-03-10",
  },
  {
    id: "3",
    customerName: "Дмитрий В.",
    carModel: "Tesla Model Y 2024",
    text: "Долго искал нормальные коврики для Теслы. Эти — лучшие. Идеальная посадка, не пахнут, выглядят дорого.",
    rating: 5,
    createdAt: "2026-02-28",
  },
];

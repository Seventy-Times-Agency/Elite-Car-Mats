import { Brand, CarModel, EvaColor, EdgeColor, MatSet, Review, Badge } from "@/types";

const logo = (name: string) =>
  `https://vl.imgix.net/img/${name}-logo.png?w=120&h=90&fit=clip&auto=format`;

export const matSets: MatSet[] = [
  { type: "front", label: "Передние", description: "Водитель + пассажир" },
  { type: "full", label: "Полный комплект", description: "Весь салон" },
  { type: "cargo", label: "Багажник", description: "Багажное отделение" },
  { type: "full-cargo", label: "Полный + Багажник", description: "Салон и багажник" },
];

export const evaColors: EvaColor[] = [
  { id: "black", name: "Чёрный", hex: "#1A1A1A" },
  { id: "gray", name: "Серый", hex: "#6B7280" },
];

export const edgeColors: EdgeColor[] = [
  { id: "black", name: "Чёрный", hex: "#1A1A1A" },
  { id: "gray", name: "Серый", hex: "#6B7280" },
  { id: "gold", name: "Золотой", hex: "#C9A84C" },
  { id: "red", name: "Красный", hex: "#DC2626" },
];

export const brands: Brand[] = [
  { id: "acura", name: "Acura", slug: "acura", logo: logo("acura"), modelsCount: 7 },
  { id: "audi", name: "Audi", slug: "audi", logo: logo("audi"), modelsCount: 16 },
  { id: "bmw", name: "BMW", slug: "bmw", logo: logo("bmw"), modelsCount: 20 },
  { id: "cadillac", name: "Cadillac", slug: "cadillac", logo: logo("cadillac"), modelsCount: 8 },
  { id: "chevrolet", name: "Chevrolet", slug: "chevrolet", logo: logo("chevrolet"), modelsCount: 15 },
  { id: "chrysler", name: "Chrysler", slug: "chrysler", logo: logo("chrysler"), modelsCount: 5 },
  { id: "dodge", name: "Dodge", slug: "dodge", logo: logo("dodge"), modelsCount: 6 },
  { id: "ford", name: "Ford", slug: "ford", logo: logo("ford"), modelsCount: 15 },
  { id: "gmc", name: "GMC", slug: "gmc", logo: logo("gmc"), modelsCount: 7 },
  { id: "honda", name: "Honda", slug: "honda", logo: logo("honda"), modelsCount: 18 },
  { id: "hyundai", name: "Hyundai", slug: "hyundai", logo: logo("hyundai"), modelsCount: 12 },
  { id: "infiniti", name: "Infiniti", slug: "infiniti", logo: logo("infiniti"), modelsCount: 8 },
  { id: "jeep", name: "Jeep", slug: "jeep", logo: logo("jeep"), modelsCount: 8 },
  { id: "kia", name: "Kia", slug: "kia", logo: logo("kia"), modelsCount: 12 },
  { id: "lexus", name: "Lexus", slug: "lexus", logo: logo("lexus"), modelsCount: 15 },
  { id: "lincoln", name: "Lincoln", slug: "lincoln", logo: logo("lincoln"), modelsCount: 5 },
  { id: "mazda", name: "Mazda", slug: "mazda", logo: logo("mazda"), modelsCount: 10 },
  { id: "mercedes", name: "Mercedes-Benz", slug: "mercedes", logo: logo("mercedes-benz"), modelsCount: 22 },
  { id: "mitsubishi", name: "Mitsubishi", slug: "mitsubishi", logo: logo("mitsubishi"), modelsCount: 6 },
  { id: "nissan", name: "Nissan", slug: "nissan", logo: logo("nissan"), modelsCount: 20 },
  { id: "porsche", name: "Porsche", slug: "porsche", logo: logo("porsche"), modelsCount: 8 },
  { id: "subaru", name: "Subaru", slug: "subaru", logo: logo("subaru"), modelsCount: 8 },
  { id: "tesla", name: "Tesla", slug: "tesla", logo: logo("tesla"), modelsCount: 5 },
  { id: "toyota", name: "Toyota", slug: "toyota", logo: logo("toyota"), modelsCount: 25 },
  { id: "volkswagen", name: "Volkswagen", slug: "volkswagen", logo: logo("volkswagen"), modelsCount: 14 },
  { id: "volvo", name: "Volvo", slug: "volvo", logo: logo("volvo"), modelsCount: 10 },
];

export const mockModels: CarModel[] = [
  { id: "camry", brandId: "toyota", brandName: "Toyota", name: "Camry", slug: "camry", years: [2018,2019,2020,2021,2022,2023,2024], bodyType: "Седан" },
  { id: "rav4", brandId: "toyota", brandName: "Toyota", name: "RAV4", slug: "rav4", years: [2019,2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "corolla", brandId: "toyota", brandName: "Toyota", name: "Corolla", slug: "corolla", years: [2019,2020,2021,2022,2023,2024], bodyType: "Седан" },
  { id: "highlander", brandId: "toyota", brandName: "Toyota", name: "Highlander", slug: "highlander", years: [2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "3-series", brandId: "bmw", brandName: "BMW", name: "3 Series", slug: "3-series", years: [2019,2020,2021,2022,2023,2024], bodyType: "Седан" },
  { id: "x5", brandId: "bmw", brandName: "BMW", name: "X5", slug: "x5", years: [2019,2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "x3", brandId: "bmw", brandName: "BMW", name: "X3", slug: "x3", years: [2018,2019,2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "c-class", brandId: "mercedes", brandName: "Mercedes-Benz", name: "C-Class", slug: "c-class", years: [2019,2020,2021,2022,2023,2024], bodyType: "Седан" },
  { id: "gle", brandId: "mercedes", brandName: "Mercedes-Benz", name: "GLE", slug: "gle", years: [2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "model-3", brandId: "tesla", brandName: "Tesla", name: "Model 3", slug: "model-3", years: [2020,2021,2022,2023,2024], bodyType: "Седан" },
  { id: "model-y", brandId: "tesla", brandName: "Tesla", name: "Model Y", slug: "model-y", years: [2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "civic", brandId: "honda", brandName: "Honda", name: "Civic", slug: "civic", years: [2017,2018,2019,2020,2021,2022,2023,2024], bodyType: "Седан" },
  { id: "cr-v", brandId: "honda", brandName: "Honda", name: "CR-V", slug: "cr-v", years: [2018,2019,2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "a4", brandId: "audi", brandName: "Audi", name: "A4", slug: "a4", years: [2017,2018,2019,2020,2021,2022,2023,2024], bodyType: "Седан" },
  { id: "q5", brandId: "audi", brandName: "Audi", name: "Q5", slug: "q5", years: [2018,2019,2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "altima", brandId: "nissan", brandName: "Nissan", name: "Altima", slug: "altima", years: [2019,2020,2021,2022,2023,2024], bodyType: "Седан" },
  { id: "rogue", brandId: "nissan", brandName: "Nissan", name: "Rogue", slug: "rogue", years: [2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "f-150", brandId: "ford", brandName: "Ford", name: "F-150", slug: "f-150", years: [2018,2019,2020,2021,2022,2023,2024], bodyType: "Пикап" },
  { id: "explorer", brandId: "ford", brandName: "Ford", name: "Explorer", slug: "explorer", years: [2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "rx", brandId: "lexus", brandName: "Lexus", name: "RX", slug: "rx", years: [2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "es", brandId: "lexus", brandName: "Lexus", name: "ES", slug: "es", years: [2019,2020,2021,2022,2023,2024], bodyType: "Седан" },
  { id: "tucson", brandId: "hyundai", brandName: "Hyundai", name: "Tucson", slug: "tucson", years: [2022,2023,2024], bodyType: "Кроссовер" },
  { id: "elantra", brandId: "hyundai", brandName: "Hyundai", name: "Elantra", slug: "elantra", years: [2021,2022,2023,2024], bodyType: "Седан" },
  { id: "sportage", brandId: "kia", brandName: "Kia", name: "Sportage", slug: "sportage", years: [2023,2024], bodyType: "Кроссовер" },
  { id: "k5", brandId: "kia", brandName: "Kia", name: "K5", slug: "k5", years: [2021,2022,2023,2024], bodyType: "Седан" },
  { id: "cx-5", brandId: "mazda", brandName: "Mazda", name: "CX-5", slug: "cx-5", years: [2018,2019,2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "outback", brandId: "subaru", brandName: "Subaru", name: "Outback", slug: "outback", years: [2020,2021,2022,2023,2024], bodyType: "Универсал" },
  { id: "wrangler", brandId: "jeep", brandName: "Jeep", name: "Wrangler", slug: "wrangler", years: [2018,2019,2020,2021,2022,2023,2024], bodyType: "Внедорожник" },
  { id: "grand-cherokee", brandId: "jeep", brandName: "Jeep", name: "Grand Cherokee", slug: "grand-cherokee", years: [2022,2023,2024], bodyType: "Кроссовер" },
  { id: "cayenne", brandId: "porsche", brandName: "Porsche", name: "Cayenne", slug: "cayenne", years: [2019,2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "xc90", brandId: "volvo", brandName: "Volvo", name: "XC90", slug: "xc90", years: [2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "escalade", brandId: "cadillac", brandName: "Cadillac", name: "Escalade", slug: "escalade", years: [2021,2022,2023,2024], bodyType: "Внедорожник" },
  { id: "silverado", brandId: "chevrolet", brandName: "Chevrolet", name: "Silverado", slug: "silverado", years: [2019,2020,2021,2022,2023,2024], bodyType: "Пикап" },
  { id: "equinox", brandId: "chevrolet", brandName: "Chevrolet", name: "Equinox", slug: "equinox", years: [2022,2023,2024], bodyType: "Кроссовер" },
  { id: "durango", brandId: "dodge", brandName: "Dodge", name: "Durango", slug: "durango", years: [2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "q50", brandId: "infiniti", brandName: "Infiniti", name: "Q50", slug: "q50", years: [2018,2019,2020,2021,2022,2023,2024], bodyType: "Седан" },
  { id: "sierra", brandId: "gmc", brandName: "GMC", name: "Sierra", slug: "sierra", years: [2019,2020,2021,2022,2023,2024], bodyType: "Пикап" },
  { id: "300", brandId: "chrysler", brandName: "Chrysler", name: "300", slug: "300", years: [2019,2020,2021,2022,2023], bodyType: "Седан" },
  { id: "mdx", brandId: "acura", brandName: "Acura", name: "MDX", slug: "mdx", years: [2022,2023,2024], bodyType: "Кроссовер" },
  { id: "outlander", brandId: "mitsubishi", brandName: "Mitsubishi", name: "Outlander", slug: "outlander", years: [2022,2023,2024], bodyType: "Кроссовер" },
  { id: "tiguan", brandId: "volkswagen", brandName: "Volkswagen", name: "Tiguan", slug: "tiguan", years: [2018,2019,2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
  { id: "aviator", brandId: "lincoln", brandName: "Lincoln", name: "Aviator", slug: "aviator", years: [2020,2021,2022,2023,2024], bodyType: "Кроссовер" },
];

export const badges: Badge[] = brands
  .filter((b) => ["toyota","bmw","mercedes","lexus","honda","audi","nissan","tesla","ford","porsche","cadillac","volkswagen","mazda","mitsubishi","hyundai","jeep","volvo","kia","dodge","infiniti","subaru","gmc","chrysler","chevrolet","acura"].includes(b.id))
  .map((b) => ({ id: b.id, brandName: b.name }));

export const mockReviews: Review[] = [
  { id: "1", customerName: "Александр М.", carModel: "Toyota Camry 2022", text: "Отличные коврики! Встали идеально, как родные. Качество EVA на высоте — не скользят, легко моются. Рекомендую!", rating: 5, createdAt: "2026-03-15" },
  { id: "2", customerName: "Ирина К.", carModel: "BMW X5 2023", text: "Заказала полный комплект с багажником. Коврики пришли быстро, упаковка надёжная. Смотрятся премиально, золотая окантовка шикарна.", rating: 5, createdAt: "2026-03-10" },
  { id: "3", customerName: "Дмитрий В.", carModel: "Tesla Model Y 2024", text: "Долго искал нормальные коврики для Теслы. Эти — лучшие. Идеальная посадка, не пахнут, выглядят дорого.", rating: 5, createdAt: "2026-02-28" },
];

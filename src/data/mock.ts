import { Brand, CarModel, EvaColor, EdgeColor, MatSet, Review, Badge } from "@/types";

const brandLogo = (name: string) =>
  `https://vl.imgix.net/img/${name}-logo.png?w=120&h=90&fit=clip&auto=format`;

export function carImage(make: string, model: string, year?: number): string {
  const y = year || 2024;
  return `https://cdn.imagin.studio/getimage?customer=hrjavascript-masede&make=${encodeURIComponent(make)}&modelFamily=${encodeURIComponent(model)}&modelYear=${y}&angle=23&width=600`;
}

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
  { id: "acura", name: "Acura", slug: "acura", logo: brandLogo("acura"), modelsCount: 5 },
  { id: "audi", name: "Audi", slug: "audi", logo: brandLogo("audi"), modelsCount: 8 },
  { id: "bmw", name: "BMW", slug: "bmw", logo: brandLogo("bmw"), modelsCount: 8 },
  { id: "cadillac", name: "Cadillac", slug: "cadillac", logo: brandLogo("cadillac"), modelsCount: 5 },
  { id: "chevrolet", name: "Chevrolet", slug: "chevrolet", logo: brandLogo("chevrolet"), modelsCount: 7 },
  { id: "chrysler", name: "Chrysler", slug: "chrysler", logo: brandLogo("chrysler"), modelsCount: 3 },
  { id: "dodge", name: "Dodge", slug: "dodge", logo: brandLogo("dodge"), modelsCount: 4 },
  { id: "ford", name: "Ford", slug: "ford", logo: brandLogo("ford"), modelsCount: 8 },
  { id: "gmc", name: "GMC", slug: "gmc", logo: brandLogo("gmc"), modelsCount: 5 },
  { id: "honda", name: "Honda", slug: "honda", logo: brandLogo("honda"), modelsCount: 7 },
  { id: "hyundai", name: "Hyundai", slug: "hyundai", logo: brandLogo("hyundai"), modelsCount: 7 },
  { id: "infiniti", name: "Infiniti", slug: "infiniti", logo: brandLogo("infiniti"), modelsCount: 4 },
  { id: "jeep", name: "Jeep", slug: "jeep", logo: brandLogo("jeep"), modelsCount: 5 },
  { id: "kia", name: "Kia", slug: "kia", logo: brandLogo("kia"), modelsCount: 7 },
  { id: "lexus", name: "Lexus", slug: "lexus", logo: brandLogo("lexus"), modelsCount: 7 },
  { id: "lincoln", name: "Lincoln", slug: "lincoln", logo: brandLogo("lincoln"), modelsCount: 4 },
  { id: "mazda", name: "Mazda", slug: "mazda", logo: brandLogo("mazda"), modelsCount: 5 },
  { id: "mercedes", name: "Mercedes-Benz", slug: "mercedes", logo: brandLogo("mercedes-benz"), modelsCount: 8 },
  { id: "mitsubishi", name: "Mitsubishi", slug: "mitsubishi", logo: brandLogo("mitsubishi"), modelsCount: 3 },
  { id: "nissan", name: "Nissan", slug: "nissan", logo: brandLogo("nissan"), modelsCount: 7 },
  { id: "porsche", name: "Porsche", slug: "porsche", logo: brandLogo("porsche"), modelsCount: 5 },
  { id: "subaru", name: "Subaru", slug: "subaru", logo: brandLogo("subaru"), modelsCount: 5 },
  { id: "tesla", name: "Tesla", slug: "tesla", logo: brandLogo("tesla"), modelsCount: 4 },
  { id: "toyota", name: "Toyota", slug: "toyota", logo: brandLogo("toyota"), modelsCount: 10 },
  { id: "volkswagen", name: "Volkswagen", slug: "volkswagen", logo: brandLogo("volkswagen"), modelsCount: 6 },
  { id: "volvo", name: "Volvo", slug: "volvo", logo: brandLogo("volvo"), modelsCount: 5 },
];

function m(id: string, brandId: string, brandName: string, name: string, slug: string, years: number[], bodyType: string): CarModel {
  return { id, brandId, brandName, name, slug, years, bodyType };
}

const Y = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

export const mockModels: CarModel[] = [
  // Acura
  m("mdx","acura","Acura","MDX","mdx",Y(2022,2025),"Кроссовер"),
  m("rdx","acura","Acura","RDX","rdx",Y(2019,2025),"Кроссовер"),
  m("tlx","acura","Acura","TLX","tlx",Y(2021,2025),"Седан"),
  m("integra","acura","Acura","Integra","integra",Y(2023,2025),"Седан"),
  m("zdx","acura","Acura","ZDX","zdx",Y(2024,2025),"Кроссовер"),
  // Audi
  m("a3","audi","Audi","A3","a3",Y(2020,2025),"Седан"),
  m("a4","audi","Audi","A4","a4",Y(2017,2025),"Седан"),
  m("a6","audi","Audi","A6","a6",Y(2019,2025),"Седан"),
  m("q3","audi","Audi","Q3","q3",Y(2019,2025),"Кроссовер"),
  m("q5","audi","Audi","Q5","q5",Y(2018,2025),"Кроссовер"),
  m("q7","audi","Audi","Q7","q7",Y(2017,2025),"Кроссовер"),
  m("q8","audi","Audi","Q8","q8",Y(2019,2025),"Кроссовер"),
  m("e-tron","audi","Audi","e-tron","e-tron",Y(2021,2025),"Кроссовер"),
  // BMW
  m("3-series","bmw","BMW","3 Series","3-series",Y(2019,2025),"Седан"),
  m("5-series","bmw","BMW","5 Series","5-series",Y(2017,2025),"Седан"),
  m("7-series","bmw","BMW","7 Series","7-series",Y(2023,2025),"Седан"),
  m("x1","bmw","BMW","X1","x1",Y(2023,2025),"Кроссовер"),
  m("x3","bmw","BMW","X3","x3",Y(2018,2025),"Кроссовер"),
  m("x5","bmw","BMW","X5","x5",Y(2019,2025),"Кроссовер"),
  m("x7","bmw","BMW","X7","x7",Y(2019,2025),"Кроссовер"),
  m("ix","bmw","BMW","iX","ix",Y(2022,2025),"Кроссовер"),
  // Cadillac
  m("escalade","cadillac","Cadillac","Escalade","escalade",Y(2021,2025),"Внедорожник"),
  m("ct5","cadillac","Cadillac","CT5","ct5",Y(2020,2025),"Седан"),
  m("xt4","cadillac","Cadillac","XT4","xt4",Y(2019,2025),"Кроссовер"),
  m("xt5","cadillac","Cadillac","XT5","xt5",Y(2017,2025),"Кроссовер"),
  m("lyriq","cadillac","Cadillac","LYRIQ","lyriq",Y(2023,2025),"Кроссовер"),
  // Chevrolet
  m("silverado","chevrolet","Chevrolet","Silverado","silverado",Y(2019,2025),"Пикап"),
  m("equinox","chevrolet","Chevrolet","Equinox","equinox",Y(2022,2025),"Кроссовер"),
  m("tahoe","chevrolet","Chevrolet","Tahoe","tahoe",Y(2021,2025),"Внедорожник"),
  m("traverse","chevrolet","Chevrolet","Traverse","traverse",Y(2018,2025),"Кроссовер"),
  m("malibu","chevrolet","Chevrolet","Malibu","malibu",Y(2016,2024),"Седан"),
  m("blazer","chevrolet","Chevrolet","Blazer","blazer",Y(2019,2025),"Кроссовер"),
  m("suburban","chevrolet","Chevrolet","Suburban","suburban",Y(2021,2025),"Внедорожник"),
  // Chrysler
  m("pacifica","chrysler","Chrysler","Pacifica","pacifica",Y(2017,2025),"Минивэн"),
  m("300","chrysler","Chrysler","300","300",Y(2015,2023),"Седан"),
  m("voyager","chrysler","Chrysler","Voyager","voyager",Y(2020,2022),"Минивэн"),
  // Dodge
  m("durango","dodge","Dodge","Durango","durango",Y(2021,2025),"Кроссовер"),
  m("challenger","dodge","Dodge","Challenger","challenger",Y(2015,2023),"Купе"),
  m("charger","dodge","Dodge","Charger","charger",Y(2015,2025),"Седан"),
  m("hornet","dodge","Dodge","Hornet","hornet",Y(2023,2025),"Кроссовер"),
  // Ford
  m("f-150","ford","Ford","F-150","f-150",Y(2018,2025),"Пикап"),
  m("explorer","ford","Ford","Explorer","explorer",Y(2020,2025),"Кроссовер"),
  m("escape","ford","Ford","Escape","escape",Y(2020,2025),"Кроссовер"),
  m("edge","ford","Ford","Edge","edge",Y(2015,2024),"Кроссовер"),
  m("bronco","ford","Ford","Bronco","bronco",Y(2021,2025),"Внедорожник"),
  m("mustang","ford","Ford","Mustang","mustang",Y(2015,2025),"Купе"),
  m("maverick","ford","Ford","Maverick","maverick",Y(2022,2025),"Пикап"),
  m("expedition","ford","Ford","Expedition","expedition",Y(2018,2025),"Внедорожник"),
  // GMC
  m("sierra","gmc","GMC","Sierra","sierra",Y(2019,2025),"Пикап"),
  m("yukon","gmc","GMC","Yukon","yukon",Y(2021,2025),"Внедорожник"),
  m("terrain","gmc","GMC","Terrain","terrain",Y(2018,2025),"Кроссовер"),
  m("acadia","gmc","GMC","Acadia","acadia",Y(2017,2025),"Кроссовер"),
  m("canyon","gmc","GMC","Canyon","canyon",Y(2023,2025),"Пикап"),
  // Honda
  m("civic","honda","Honda","Civic","civic",Y(2016,2025),"Седан"),
  m("accord","honda","Honda","Accord","accord",Y(2018,2025),"Седан"),
  m("cr-v","honda","Honda","CR-V","cr-v",Y(2017,2025),"Кроссовер"),
  m("hr-v","honda","Honda","HR-V","hr-v",Y(2023,2025),"Кроссовер"),
  m("pilot","honda","Honda","Pilot","pilot",Y(2023,2025),"Кроссовер"),
  m("odyssey","honda","Honda","Odyssey","odyssey",Y(2018,2025),"Минивэн"),
  m("ridgeline","honda","Honda","Ridgeline","ridgeline",Y(2017,2025),"Пикап"),
  // Hyundai
  m("tucson","hyundai","Hyundai","Tucson","tucson",Y(2022,2025),"Кроссовер"),
  m("santa-fe","hyundai","Hyundai","Santa Fe","santa-fe",Y(2019,2025),"Кроссовер"),
  m("elantra","hyundai","Hyundai","Elantra","elantra",Y(2021,2025),"Седан"),
  m("sonata","hyundai","Hyundai","Sonata","sonata",Y(2020,2025),"Седан"),
  m("palisade","hyundai","Hyundai","Palisade","palisade",Y(2020,2025),"Кроссовер"),
  m("kona","hyundai","Hyundai","Kona","kona",Y(2018,2025),"Кроссовер"),
  m("ioniq-5","hyundai","Hyundai","Ioniq 5","ioniq-5",Y(2022,2025),"Кроссовер"),
  // Infiniti
  m("q50","infiniti","Infiniti","Q50","q50",Y(2014,2025),"Седан"),
  m("q60","infiniti","Infiniti","Q60","q60",Y(2017,2024),"Купе"),
  m("qx50","infiniti","Infiniti","QX50","qx50",Y(2019,2025),"Кроссовер"),
  m("qx60","infiniti","Infiniti","QX60","qx60",Y(2022,2025),"Кроссовер"),
  // Jeep
  m("wrangler","jeep","Jeep","Wrangler","wrangler",Y(2018,2025),"Внедорожник"),
  m("grand-cherokee","jeep","Jeep","Grand Cherokee","grand-cherokee",Y(2022,2025),"Кроссовер"),
  m("cherokee","jeep","Jeep","Cherokee","cherokee",Y(2014,2023),"Кроссовер"),
  m("compass","jeep","Jeep","Compass","compass",Y(2017,2025),"Кроссовер"),
  m("gladiator","jeep","Jeep","Gladiator","gladiator",Y(2020,2025),"Пикап"),
  // Kia
  m("sportage","kia","Kia","Sportage","sportage",Y(2023,2025),"Кроссовер"),
  m("k5","kia","Kia","K5","k5",Y(2021,2025),"Седан"),
  m("telluride","kia","Kia","Telluride","telluride",Y(2020,2025),"Кроссовер"),
  m("sorento","kia","Kia","Sorento","sorento",Y(2021,2025),"Кроссовер"),
  m("forte","kia","Kia","Forte","forte",Y(2019,2025),"Седан"),
  m("seltos","kia","Kia","Seltos","seltos",Y(2021,2025),"Кроссовер"),
  m("ev6","kia","Kia","EV6","ev6",Y(2022,2025),"Кроссовер"),
  // Lexus
  m("rx","lexus","Lexus","RX","rx",Y(2020,2025),"Кроссовер"),
  m("es","lexus","Lexus","ES","es",Y(2019,2025),"Седан"),
  m("nx","lexus","Lexus","NX","nx",Y(2022,2025),"Кроссовер"),
  m("is","lexus","Lexus","IS","is",Y(2021,2025),"Седан"),
  m("gx","lexus","Lexus","GX","gx",Y(2024,2025),"Внедорожник"),
  m("tx","lexus","Lexus","TX","tx",Y(2024,2025),"Кроссовер"),
  m("lx","lexus","Lexus","LX","lx",Y(2022,2025),"Внедорожник"),
  // Lincoln
  m("aviator","lincoln","Lincoln","Aviator","aviator",Y(2020,2025),"Кроссовер"),
  m("corsair","lincoln","Lincoln","Corsair","corsair",Y(2020,2025),"Кроссовер"),
  m("nautilus","lincoln","Lincoln","Nautilus","nautilus",Y(2019,2025),"Кроссовер"),
  m("navigator","lincoln","Lincoln","Navigator","navigator",Y(2018,2025),"Внедорожник"),
  // Mazda
  m("cx-5","mazda","Mazda","CX-5","cx-5",Y(2017,2025),"Кроссовер"),
  m("cx-50","mazda","Mazda","CX-50","cx-50",Y(2023,2025),"Кроссовер"),
  m("cx-90","mazda","Mazda","CX-90","cx-90",Y(2024,2025),"Кроссовер"),
  m("mazda3","mazda","Mazda","Mazda3","mazda3",Y(2019,2025),"Седан"),
  m("mx-5","mazda","Mazda","MX-5","mx-5",Y(2016,2025),"Родстер"),
  // Mercedes-Benz
  m("c-class","mercedes","Mercedes-Benz","C-Class","c-class",Y(2015,2025),"Седан"),
  m("e-class","mercedes","Mercedes-Benz","E-Class","e-class",Y(2017,2025),"Седан"),
  m("s-class","mercedes","Mercedes-Benz","S-Class","s-class",Y(2021,2025),"Седан"),
  m("gle","mercedes","Mercedes-Benz","GLE","gle",Y(2020,2025),"Кроссовер"),
  m("glc","mercedes","Mercedes-Benz","GLC","glc",Y(2023,2025),"Кроссовер"),
  m("gla","mercedes","Mercedes-Benz","GLA","gla",Y(2021,2025),"Кроссовер"),
  m("glb","mercedes","Mercedes-Benz","GLB","glb",Y(2020,2025),"Кроссовер"),
  m("gls","mercedes","Mercedes-Benz","GLS","gls",Y(2020,2025),"Внедорожник"),
  // Mitsubishi
  m("outlander","mitsubishi","Mitsubishi","Outlander","outlander",Y(2022,2025),"Кроссовер"),
  m("eclipse-cross","mitsubishi","Mitsubishi","Eclipse Cross","eclipse-cross",Y(2018,2025),"Кроссовер"),
  m("outlander-sport","mitsubishi","Mitsubishi","Outlander Sport","outlander-sport",Y(2020,2025),"Кроссовер"),
  // Nissan
  m("altima","nissan","Nissan","Altima","altima",Y(2019,2025),"Седан"),
  m("rogue","nissan","Nissan","Rogue","rogue",Y(2021,2025),"Кроссовер"),
  m("sentra","nissan","Nissan","Sentra","sentra",Y(2020,2025),"Седан"),
  m("pathfinder","nissan","Nissan","Pathfinder","pathfinder",Y(2022,2025),"Кроссовер"),
  m("murano","nissan","Nissan","Murano","murano",Y(2015,2024),"Кроссовер"),
  m("frontier","nissan","Nissan","Frontier","frontier",Y(2022,2025),"Пикап"),
  m("kicks","nissan","Nissan","Kicks","kicks",Y(2018,2025),"Кроссовер"),
  // Porsche
  m("cayenne","porsche","Porsche","Cayenne","cayenne",Y(2019,2025),"Кроссовер"),
  m("macan","porsche","Porsche","Macan","macan",Y(2019,2025),"Кроссовер"),
  m("911","porsche","Porsche","911","911",Y(2020,2025),"Купе"),
  m("taycan","porsche","Porsche","Taycan","taycan",Y(2020,2025),"Седан"),
  m("panamera","porsche","Porsche","Panamera","panamera",Y(2017,2025),"Седан"),
  // Subaru
  m("outback","subaru","Subaru","Outback","outback",Y(2020,2025),"Универсал"),
  m("forester","subaru","Subaru","Forester","forester",Y(2019,2025),"Кроссовер"),
  m("crosstrek","subaru","Subaru","Crosstrek","crosstrek",Y(2024,2025),"Кроссовер"),
  m("impreza","subaru","Subaru","Impreza","impreza",Y(2017,2025),"Седан"),
  m("ascent","subaru","Subaru","Ascent","ascent",Y(2019,2025),"Кроссовер"),
  // Tesla
  m("model-3","tesla","Tesla","Model 3","model-3",Y(2018,2025),"Седан"),
  m("model-y","tesla","Tesla","Model Y","model-y",Y(2021,2025),"Кроссовер"),
  m("model-s","tesla","Tesla","Model S","model-s",Y(2016,2025),"Седан"),
  m("model-x","tesla","Tesla","Model X","model-x",Y(2016,2025),"Кроссовер"),
  // Toyota
  m("camry","toyota","Toyota","Camry","camry",Y(2018,2025),"Седан"),
  m("rav4","toyota","Toyota","RAV4","rav4",Y(2019,2025),"Кроссовер"),
  m("corolla","toyota","Toyota","Corolla","corolla",Y(2019,2025),"Седан"),
  m("highlander","toyota","Toyota","Highlander","highlander",Y(2020,2025),"Кроссовер"),
  m("tacoma","toyota","Toyota","Tacoma","tacoma",Y(2016,2025),"Пикап"),
  m("tundra","toyota","Toyota","Tundra","tundra",Y(2022,2025),"Пикап"),
  m("4runner","toyota","Toyota","4Runner","4runner",Y(2024,2025),"Внедорожник"),
  m("sienna","toyota","Toyota","Sienna","sienna",Y(2021,2025),"Минивэн"),
  m("venza","toyota","Toyota","Venza","venza",Y(2021,2025),"Кроссовер"),
  m("prius","toyota","Toyota","Prius","prius",Y(2023,2025),"Хэтчбек"),
  // Volkswagen
  m("tiguan","volkswagen","Volkswagen","Tiguan","tiguan",Y(2018,2025),"Кроссовер"),
  m("atlas","volkswagen","Volkswagen","Atlas","atlas",Y(2018,2025),"Кроссовер"),
  m("jetta","volkswagen","Volkswagen","Jetta","jetta",Y(2019,2025),"Седан"),
  m("taos","volkswagen","Volkswagen","Taos","taos",Y(2022,2025),"Кроссовер"),
  m("id4","volkswagen","Volkswagen","ID.4","id4",Y(2021,2025),"Кроссовер"),
  m("golf","volkswagen","Volkswagen","Golf","golf",Y(2015,2025),"Хэтчбек"),
  // Volvo
  m("xc90","volvo","Volvo","XC90","xc90",Y(2016,2025),"Кроссовер"),
  m("xc60","volvo","Volvo","XC60","xc60",Y(2018,2025),"Кроссовер"),
  m("xc40","volvo","Volvo","XC40","xc40",Y(2019,2025),"Кроссовер"),
  m("s60","volvo","Volvo","S60","s60",Y(2019,2025),"Седан"),
  m("v60","volvo","Volvo","V60","v60",Y(2019,2025),"Универсал"),
];

export const badges: Badge[] = brands.map((b) => ({ id: b.id, brandName: b.name }));

export const mockReviews: Review[] = [
  { id: "1", customerName: "Александр М.", carModel: "Toyota Camry 2022", text: "Отличные коврики! Встали идеально, как родные. Качество EVA на высоте — не скользят, легко моются. Рекомендую!", rating: 5, createdAt: "2026-03-15" },
  { id: "2", customerName: "Ирина К.", carModel: "BMW X5 2023", text: "Заказала полный комплект с багажником. Коврики пришли быстро, упаковка надёжная. Смотрятся премиально, золотая окантовка шикарна.", rating: 5, createdAt: "2026-03-10" },
  { id: "3", customerName: "Дмитрий В.", carModel: "Tesla Model Y 2024", text: "Долго искал нормальные коврики для Теслы. Эти — лучшие. Идеальная посадка, не пахнут, выглядят дорого.", rating: 5, createdAt: "2026-02-28" },
];

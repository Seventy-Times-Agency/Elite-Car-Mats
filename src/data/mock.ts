import { Brand, CarModel, EvaColor, EdgeColor, MatSet, Review, Badge } from "@/types";

const brandLogo = (name: string) =>
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
  { id: "acura", name: "Acura", slug: "acura", logo: brandLogo("acura"), modelsCount: 0 },
  { id: "alfa-romeo", name: "Alfa Romeo", slug: "alfa-romeo", logo: brandLogo("alfa-romeo"), modelsCount: 0 },
  { id: "aston-martin", name: "Aston Martin", slug: "aston-martin", logo: brandLogo("aston-martin"), modelsCount: 0 },
  { id: "audi", name: "Audi", slug: "audi", logo: brandLogo("audi"), modelsCount: 0 },
  { id: "bentley", name: "Bentley", slug: "bentley", logo: brandLogo("bentley"), modelsCount: 0 },
  { id: "bmw", name: "BMW", slug: "bmw", logo: brandLogo("bmw"), modelsCount: 0 },
  { id: "buick", name: "Buick", slug: "buick", logo: brandLogo("buick"), modelsCount: 0 },
  { id: "cadillac", name: "Cadillac", slug: "cadillac", logo: brandLogo("cadillac"), modelsCount: 0 },
  { id: "chevrolet", name: "Chevrolet", slug: "chevrolet", logo: brandLogo("chevrolet"), modelsCount: 0 },
  { id: "chrysler", name: "Chrysler", slug: "chrysler", logo: brandLogo("chrysler"), modelsCount: 0 },
  { id: "dodge", name: "Dodge", slug: "dodge", logo: brandLogo("dodge"), modelsCount: 0 },
  { id: "fiat", name: "Fiat", slug: "fiat", logo: brandLogo("fiat"), modelsCount: 0 },
  { id: "ford", name: "Ford", slug: "ford", logo: brandLogo("ford"), modelsCount: 0 },
  { id: "genesis", name: "Genesis", slug: "genesis", logo: brandLogo("genesis"), modelsCount: 0 },
  { id: "gmc", name: "GMC", slug: "gmc", logo: brandLogo("gmc"), modelsCount: 0 },
  { id: "honda", name: "Honda", slug: "honda", logo: brandLogo("honda"), modelsCount: 0 },
  { id: "hyundai", name: "Hyundai", slug: "hyundai", logo: brandLogo("hyundai"), modelsCount: 0 },
  { id: "infiniti", name: "Infiniti", slug: "infiniti", logo: brandLogo("infiniti"), modelsCount: 0 },
  { id: "jaguar", name: "Jaguar", slug: "jaguar", logo: brandLogo("jaguar"), modelsCount: 0 },
  { id: "jeep", name: "Jeep", slug: "jeep", logo: brandLogo("jeep"), modelsCount: 0 },
  { id: "kia", name: "Kia", slug: "kia", logo: brandLogo("kia"), modelsCount: 0 },
  { id: "lamborghini", name: "Lamborghini", slug: "lamborghini", logo: brandLogo("lamborghini"), modelsCount: 0 },
  { id: "land-rover", name: "Land Rover", slug: "land-rover", logo: brandLogo("land-rover"), modelsCount: 0 },
  { id: "lexus", name: "Lexus", slug: "lexus", logo: brandLogo("lexus"), modelsCount: 0 },
  { id: "lincoln", name: "Lincoln", slug: "lincoln", logo: brandLogo("lincoln"), modelsCount: 0 },
  { id: "lucid", name: "Lucid", slug: "lucid", logo: brandLogo("lucid"), modelsCount: 0 },
  { id: "maserati", name: "Maserati", slug: "maserati", logo: brandLogo("maserati"), modelsCount: 0 },
  { id: "mazda", name: "Mazda", slug: "mazda", logo: brandLogo("mazda"), modelsCount: 0 },
  { id: "mclaren", name: "McLaren", slug: "mclaren", logo: brandLogo("mclaren"), modelsCount: 0 },
  { id: "mercedes", name: "Mercedes-Benz", slug: "mercedes", logo: brandLogo("mercedes-benz"), modelsCount: 0 },
  { id: "mini", name: "MINI", slug: "mini", logo: brandLogo("mini"), modelsCount: 0 },
  { id: "mitsubishi", name: "Mitsubishi", slug: "mitsubishi", logo: brandLogo("mitsubishi"), modelsCount: 0 },
  { id: "nissan", name: "Nissan", slug: "nissan", logo: brandLogo("nissan"), modelsCount: 0 },
  { id: "polestar", name: "Polestar", slug: "polestar", logo: brandLogo("polestar"), modelsCount: 0 },
  { id: "porsche", name: "Porsche", slug: "porsche", logo: brandLogo("porsche"), modelsCount: 0 },
  { id: "ram", name: "Ram", slug: "ram", logo: brandLogo("ram"), modelsCount: 0 },
  { id: "rivian", name: "Rivian", slug: "rivian", logo: brandLogo("rivian"), modelsCount: 0 },
  { id: "rolls-royce", name: "Rolls-Royce", slug: "rolls-royce", logo: brandLogo("rolls-royce"), modelsCount: 0 },
  { id: "subaru", name: "Subaru", slug: "subaru", logo: brandLogo("subaru"), modelsCount: 0 },
  { id: "tesla", name: "Tesla", slug: "tesla", logo: brandLogo("tesla"), modelsCount: 0 },
  { id: "toyota", name: "Toyota", slug: "toyota", logo: brandLogo("toyota"), modelsCount: 0 },
  { id: "volkswagen", name: "Volkswagen", slug: "volkswagen", logo: brandLogo("volkswagen"), modelsCount: 0 },
  { id: "volvo", name: "Volvo", slug: "volvo", logo: brandLogo("volvo"), modelsCount: 0 },
];

import { VehicleCategory } from "@/types";

function categoryFromBody(bodyType: string): VehicleCategory {
  if (bodyType === "Пикап" || bodyType === "Фургон") return "truck";
  if (bodyType === "Кроссовер" || bodyType === "Внедорожник") return "suv";
  return "car";
}

function m(id: string, brandId: string, brandName: string, name: string, slug: string, years: number[], bodyType: string): CarModel {
  return { id, brandId, brandName, name, slug, years, bodyType, category: categoryFromBody(bodyType) };
}

export const categoryLabels: Record<VehicleCategory, string> = {
  car: "Легковые",
  suv: "SUV / Кроссоверы",
  truck: "Пикапы / Фургоны",
};

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
  m("a5","audi","Audi","A5","a5",Y(2018,2025),"Купе"),
  m("a7","audi","Audi","A7","a7",Y(2019,2025),"Седан"),
  m("a8","audi","Audi","A8","a8",Y(2019,2025),"Седан"),
  m("e-tron-gt","audi","Audi","e-tron GT","e-tron-gt",Y(2022,2025),"Седан"),
  m("q4-e-tron","audi","Audi","Q4 e-tron","q4-e-tron",Y(2022,2025),"Кроссовер"),
  m("rs6","audi","Audi","RS6","rs6",Y(2020,2025),"Универсал"),
  m("tt","audi","Audi","TT","tt",Y(2016,2023),"Купе"),
  // BMW
  m("3-series","bmw","BMW","3 Series","3-series",Y(2019,2025),"Седан"),
  m("5-series","bmw","BMW","5 Series","5-series",Y(2017,2025),"Седан"),
  m("7-series","bmw","BMW","7 Series","7-series",Y(2023,2025),"Седан"),
  m("x1","bmw","BMW","X1","x1",Y(2023,2025),"Кроссовер"),
  m("x3","bmw","BMW","X3","x3",Y(2018,2025),"Кроссовер"),
  m("x5","bmw","BMW","X5","x5",Y(2019,2025),"Кроссовер"),
  m("x7","bmw","BMW","X7","x7",Y(2019,2025),"Кроссовер"),
  m("ix","bmw","BMW","iX","ix",Y(2022,2025),"Кроссовер"),
  m("2-series","bmw","BMW","2 Series","2-series",Y(2017,2025),"Купе"),
  m("4-series","bmw","BMW","4 Series","4-series",Y(2021,2025),"Купе"),
  m("8-series","bmw","BMW","8 Series","8-series",Y(2019,2025),"Купе"),
  m("x2","bmw","BMW","X2","x2",Y(2018,2025),"Кроссовер"),
  m("x4","bmw","BMW","X4","x4",Y(2019,2025),"Кроссовер"),
  m("x6","bmw","BMW","X6","x6",Y(2020,2025),"Кроссовер"),
  m("i4","bmw","BMW","i4","i4",Y(2022,2025),"Седан"),
  m("i5","bmw","BMW","i5","i5",Y(2024,2025),"Седан"),
  m("i7","bmw","BMW","i7","i7",Y(2023,2025),"Седан"),
  m("z4","bmw","BMW","Z4","z4",Y(2019,2025),"Родстер"),
  // Cadillac
  m("escalade","cadillac","Cadillac","Escalade","escalade",Y(2021,2025),"Внедорожник"),
  m("ct5","cadillac","Cadillac","CT5","ct5",Y(2020,2025),"Седан"),
  m("xt4","cadillac","Cadillac","XT4","xt4",Y(2019,2025),"Кроссовер"),
  m("xt5","cadillac","Cadillac","XT5","xt5",Y(2017,2025),"Кроссовер"),
  m("lyriq","cadillac","Cadillac","LYRIQ","lyriq",Y(2023,2025),"Кроссовер"),
  m("ct4","cadillac","Cadillac","CT4","ct4",Y(2020,2025),"Седан"),
  m("xt6","cadillac","Cadillac","XT6","xt6",Y(2020,2025),"Кроссовер"),
  m("celestiq","cadillac","Cadillac","Celestiq","celestiq",Y(2025,2025),"Седан"),
  // Chevrolet
  m("silverado","chevrolet","Chevrolet","Silverado","silverado",Y(2019,2025),"Пикап"),
  m("equinox","chevrolet","Chevrolet","Equinox","equinox",Y(2022,2025),"Кроссовер"),
  m("tahoe","chevrolet","Chevrolet","Tahoe","tahoe",Y(2021,2025),"Внедорожник"),
  m("traverse","chevrolet","Chevrolet","Traverse","traverse",Y(2018,2025),"Кроссовер"),
  m("malibu","chevrolet","Chevrolet","Malibu","malibu",Y(2016,2024),"Седан"),
  m("blazer","chevrolet","Chevrolet","Blazer","blazer",Y(2019,2025),"Кроссовер"),
  m("suburban","chevrolet","Chevrolet","Suburban","suburban",Y(2021,2025),"Внедорожник"),
  m("corvette","chevrolet","Chevrolet","Corvette","corvette",Y(2020,2025),"Купе"),
  m("camaro","chevrolet","Chevrolet","Camaro","camaro",Y(2016,2024),"Купе"),
  m("colorado","chevrolet","Chevrolet","Colorado","colorado",Y(2023,2025),"Пикап"),
  m("trailblazer","chevrolet","Chevrolet","Trailblazer","trailblazer",Y(2021,2025),"Кроссовер"),
  m("trax","chevrolet","Chevrolet","Trax","trax",Y(2024,2025),"Кроссовер"),
  m("bolt-ev","chevrolet","Chevrolet","Bolt EV","bolt-ev",Y(2019,2023),"Хэтчбек"),
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
  m("ranger","ford","Ford","Ranger","ranger",Y(2019,2025),"Пикап"),
  m("mustang-mach-e","ford","Ford","Mustang Mach-E","mustang-mach-e",Y(2021,2025),"Кроссовер"),
  m("transit","ford","Ford","Transit","transit",Y(2020,2025),"Фургон"),
  m("transit-connect","ford","Ford","Transit Connect","transit-connect",Y(2019,2023),"Фургон"),
  // GMC
  m("sierra","gmc","GMC","Sierra","sierra",Y(2019,2025),"Пикап"),
  m("yukon","gmc","GMC","Yukon","yukon",Y(2021,2025),"Внедорожник"),
  m("terrain","gmc","GMC","Terrain","terrain",Y(2018,2025),"Кроссовер"),
  m("acadia","gmc","GMC","Acadia","acadia",Y(2017,2025),"Кроссовер"),
  m("canyon","gmc","GMC","Canyon","canyon",Y(2023,2025),"Пикап"),
  m("hummer-ev","gmc","GMC","Hummer EV","hummer-ev",Y(2022,2025),"Пикап"),
  m("yukon-xl","gmc","GMC","Yukon XL","yukon-xl",Y(2021,2025),"Внедорожник"),
  // Honda
  m("civic","honda","Honda","Civic","civic",Y(2016,2025),"Седан"),
  m("accord","honda","Honda","Accord","accord",Y(2018,2025),"Седан"),
  m("cr-v","honda","Honda","CR-V","cr-v",Y(2017,2025),"Кроссовер"),
  m("hr-v","honda","Honda","HR-V","hr-v",Y(2023,2025),"Кроссовер"),
  m("pilot","honda","Honda","Pilot","pilot",Y(2023,2025),"Кроссовер"),
  m("odyssey","honda","Honda","Odyssey","odyssey",Y(2018,2025),"Минивэн"),
  m("ridgeline","honda","Honda","Ridgeline","ridgeline",Y(2017,2025),"Пикап"),
  m("passport","honda","Honda","Passport","passport",Y(2019,2025),"Кроссовер"),
  m("prologue","honda","Honda","Prologue","prologue",Y(2024,2025),"Кроссовер"),
  // Hyundai
  m("tucson","hyundai","Hyundai","Tucson","tucson",Y(2022,2025),"Кроссовер"),
  m("santa-fe","hyundai","Hyundai","Santa Fe","santa-fe",Y(2019,2025),"Кроссовер"),
  m("elantra","hyundai","Hyundai","Elantra","elantra",Y(2021,2025),"Седан"),
  m("sonata","hyundai","Hyundai","Sonata","sonata",Y(2020,2025),"Седан"),
  m("palisade","hyundai","Hyundai","Palisade","palisade",Y(2020,2025),"Кроссовер"),
  m("kona","hyundai","Hyundai","Kona","kona",Y(2018,2025),"Кроссовер"),
  m("ioniq-5","hyundai","Hyundai","Ioniq 5","ioniq-5",Y(2022,2025),"Кроссовер"),
  m("ioniq-6","hyundai","Hyundai","Ioniq 6","ioniq-6",Y(2023,2025),"Седан"),
  m("venue","hyundai","Hyundai","Venue","venue",Y(2020,2025),"Кроссовер"),
  m("santa-cruz","hyundai","Hyundai","Santa Cruz","santa-cruz",Y(2022,2025),"Пикап"),
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
  m("wagoneer","jeep","Jeep","Wagoneer","wagoneer",Y(2022,2025),"Внедорожник"),
  m("grand-wagoneer","jeep","Jeep","Grand Wagoneer","grand-wagoneer",Y(2022,2025),"Внедорожник"),
  m("renegade","jeep","Jeep","Renegade","renegade",Y(2018,2023),"Кроссовер"),
  // Kia
  m("sportage","kia","Kia","Sportage","sportage",Y(2023,2025),"Кроссовер"),
  m("k5","kia","Kia","K5","k5",Y(2021,2025),"Седан"),
  m("telluride","kia","Kia","Telluride","telluride",Y(2020,2025),"Кроссовер"),
  m("sorento","kia","Kia","Sorento","sorento",Y(2021,2025),"Кроссовер"),
  m("forte","kia","Kia","Forte","forte",Y(2019,2025),"Седан"),
  m("seltos","kia","Kia","Seltos","seltos",Y(2021,2025),"Кроссовер"),
  m("ev6","kia","Kia","EV6","ev6",Y(2022,2025),"Кроссовер"),
  m("niro","kia","Kia","Niro","niro",Y(2023,2025),"Кроссовер"),
  m("carnival","kia","Kia","Carnival","carnival",Y(2022,2025),"Минивэн"),
  m("soul","kia","Kia","Soul","soul",Y(2020,2025),"Хэтчбек"),
  m("ev9","kia","Kia","EV9","ev9",Y(2024,2025),"Кроссовер"),
  // Lexus
  m("rx","lexus","Lexus","RX","rx",Y(2020,2025),"Кроссовер"),
  m("es","lexus","Lexus","ES","es",Y(2019,2025),"Седан"),
  m("nx","lexus","Lexus","NX","nx",Y(2022,2025),"Кроссовер"),
  m("is","lexus","Lexus","IS","is",Y(2021,2025),"Седан"),
  m("gx","lexus","Lexus","GX","gx",Y(2024,2025),"Внедорожник"),
  m("tx","lexus","Lexus","TX","tx",Y(2024,2025),"Кроссовер"),
  m("lx","lexus","Lexus","LX","lx",Y(2022,2025),"Внедорожник"),
  m("lc","lexus","Lexus","LC","lc",Y(2018,2025),"Купе"),
  m("ls","lexus","Lexus","LS","ls",Y(2018,2025),"Седан"),
  m("ux","lexus","Lexus","UX","ux",Y(2019,2025),"Кроссовер"),
  m("rc","lexus","Lexus","RC","rc",Y(2015,2024),"Купе"),
  m("rz","lexus","Lexus","RZ","rz",Y(2023,2025),"Кроссовер"),
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
  m("g-class","mercedes","Mercedes-Benz","G-Class","g-class",Y(2019,2025),"Внедорожник"),
  m("cla","mercedes","Mercedes-Benz","CLA","cla",Y(2020,2025),"Седан"),
  m("cls","mercedes","Mercedes-Benz","CLS","cls",Y(2019,2023),"Седан"),
  m("eqs","mercedes","Mercedes-Benz","EQS","eqs",Y(2022,2025),"Седан"),
  m("eqe","mercedes","Mercedes-Benz","EQE","eqe",Y(2023,2025),"Седан"),
  m("eqb","mercedes","Mercedes-Benz","EQB","eqb",Y(2023,2025),"Кроссовер"),
  m("sprinter","mercedes","Mercedes-Benz","Sprinter","sprinter",Y(2019,2025),"Фургон"),
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
  m("maxima","nissan","Nissan","Maxima","maxima",Y(2016,2023),"Седан"),
  m("armada","nissan","Nissan","Armada","armada",Y(2017,2025),"Внедорожник"),
  m("titan","nissan","Nissan","Titan","titan",Y(2017,2024),"Пикап"),
  m("leaf","nissan","Nissan","Leaf","leaf",Y(2018,2025),"Хэтчбек"),
  m("ariya","nissan","Nissan","Ariya","ariya",Y(2023,2025),"Кроссовер"),
  m("z","nissan","Nissan","Z","z",Y(2023,2025),"Купе"),
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
  m("legacy","subaru","Subaru","Legacy","legacy",Y(2020,2025),"Седан"),
  m("brz","subaru","Subaru","BRZ","brz",Y(2022,2025),"Купе"),
  m("wrx","subaru","Subaru","WRX","wrx",Y(2022,2025),"Седан"),
  m("solterra","subaru","Subaru","Solterra","solterra",Y(2023,2025),"Кроссовер"),
  // Tesla
  m("model-3","tesla","Tesla","Model 3","model-3",Y(2018,2025),"Седан"),
  m("model-y","tesla","Tesla","Model Y","model-y",Y(2021,2025),"Кроссовер"),
  m("model-s","tesla","Tesla","Model S","model-s",Y(2016,2025),"Седан"),
  m("model-x","tesla","Tesla","Model X","model-x",Y(2016,2025),"Кроссовер"),
  m("cybertruck","tesla","Tesla","Cybertruck","cybertruck",Y(2024,2025),"Пикап"),
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
  m("supra","toyota","Toyota","Supra","supra",Y(2020,2025),"Купе"),
  m("gr86","toyota","Toyota","GR86","gr86",Y(2022,2025),"Купе"),
  m("gr-corolla","toyota","Toyota","GR Corolla","gr-corolla",Y(2023,2025),"Хэтчбек"),
  m("crown","toyota","Toyota","Crown","crown",Y(2023,2025),"Седан"),
  m("sequoia","toyota","Toyota","Sequoia","sequoia",Y(2023,2025),"Внедорожник"),
  m("land-cruiser","toyota","Toyota","Land Cruiser","land-cruiser",Y(2024,2025),"Внедорожник"),
  m("bz4x","toyota","Toyota","bZ4X","bz4x",Y(2023,2025),"Кроссовер"),
  m("mirai","toyota","Toyota","Mirai","mirai",Y(2021,2025),"Седан"),
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
  m("s90","volvo","Volvo","S90","s90",Y(2017,2025),"Седан"),
  m("v90","volvo","Volvo","V90","v90",Y(2017,2024),"Универсал"),
  m("ex30","volvo","Volvo","EX30","ex30",Y(2024,2025),"Кроссовер"),
  m("ex90","volvo","Volvo","EX90","ex90",Y(2024,2025),"Кроссовер"),
  // Alfa Romeo
  m("giulia","alfa-romeo","Alfa Romeo","Giulia","giulia",Y(2017,2025),"Седан"),
  m("stelvio","alfa-romeo","Alfa Romeo","Stelvio","stelvio",Y(2018,2025),"Кроссовер"),
  m("tonale","alfa-romeo","Alfa Romeo","Tonale","tonale",Y(2024,2025),"Кроссовер"),
  // Aston Martin
  m("db11","aston-martin","Aston Martin","DB11","db11",Y(2017,2023),"Купе"),
  m("db12","aston-martin","Aston Martin","DB12","db12",Y(2024,2025),"Купе"),
  m("dbx","aston-martin","Aston Martin","DBX","dbx",Y(2021,2025),"Кроссовер"),
  m("vantage","aston-martin","Aston Martin","Vantage","vantage",Y(2019,2025),"Купе"),
  // Bentley
  m("continental-gt","bentley","Bentley","Continental GT","continental-gt",Y(2018,2025),"Купе"),
  m("flying-spur","bentley","Bentley","Flying Spur","flying-spur",Y(2020,2025),"Седан"),
  m("bentayga","bentley","Bentley","Bentayga","bentayga",Y(2017,2025),"Кроссовер"),
  // Buick
  m("enclave","buick","Buick","Enclave","enclave",Y(2018,2025),"Кроссовер"),
  m("encore-gx","buick","Buick","Encore GX","encore-gx",Y(2020,2025),"Кроссовер"),
  m("envision","buick","Buick","Envision","envision",Y(2021,2025),"Кроссовер"),
  m("envista","buick","Buick","Envista","envista",Y(2024,2025),"Кроссовер"),
  // Fiat
  m("500","fiat","Fiat","500","500",Y(2016,2019),"Хэтчбек"),
  m("500x","fiat","Fiat","500X","500x",Y(2016,2023),"Кроссовер"),
  m("500e","fiat","Fiat","500e","500e",Y(2024,2025),"Хэтчбек"),
  // Genesis
  m("g70","genesis","Genesis","G70","g70",Y(2019,2025),"Седан"),
  m("g80","genesis","Genesis","G80","g80",Y(2021,2025),"Седан"),
  m("g90","genesis","Genesis","G90","g90",Y(2023,2025),"Седан"),
  m("gv60","genesis","Genesis","GV60","gv60",Y(2023,2025),"Кроссовер"),
  m("gv70","genesis","Genesis","GV70","gv70",Y(2022,2025),"Кроссовер"),
  m("gv80","genesis","Genesis","GV80","gv80",Y(2021,2025),"Кроссовер"),
  // Jaguar
  m("f-pace","jaguar","Jaguar","F-Pace","f-pace",Y(2017,2025),"Кроссовер"),
  m("e-pace","jaguar","Jaguar","E-Pace","e-pace",Y(2018,2025),"Кроссовер"),
  m("i-pace","jaguar","Jaguar","I-Pace","i-pace",Y(2019,2024),"Кроссовер"),
  m("xf","jaguar","Jaguar","XF","xf",Y(2016,2025),"Седан"),
  // Lamborghini
  m("urus","lamborghini","Lamborghini","Urus","urus",Y(2019,2025),"Кроссовер"),
  m("huracan","lamborghini","Lamborghini","Huracán","huracan",Y(2015,2024),"Купе"),
  m("revuelto","lamborghini","Lamborghini","Revuelto","revuelto",Y(2024,2025),"Купе"),
  // Land Rover
  m("defender","land-rover","Land Rover","Defender","defender",Y(2020,2025),"Внедорожник"),
  m("discovery","land-rover","Land Rover","Discovery","discovery",Y(2017,2025),"Внедорожник"),
  m("discovery-sport","land-rover","Land Rover","Discovery Sport","discovery-sport",Y(2015,2025),"Кроссовер"),
  m("range-rover","land-rover","Land Rover","Range Rover","range-rover",Y(2022,2025),"Внедорожник"),
  m("range-rover-sport","land-rover","Land Rover","Range Rover Sport","range-rover-sport",Y(2023,2025),"Внедорожник"),
  m("range-rover-velar","land-rover","Land Rover","Range Rover Velar","range-rover-velar",Y(2018,2025),"Кроссовер"),
  m("range-rover-evoque","land-rover","Land Rover","Range Rover Evoque","range-rover-evoque",Y(2020,2025),"Кроссовер"),
  // Lucid
  m("air","lucid","Lucid","Air","air",Y(2022,2025),"Седан"),
  m("gravity","lucid","Lucid","Gravity","gravity",Y(2025,2025),"Кроссовер"),
  // Maserati
  m("ghibli","maserati","Maserati","Ghibli","ghibli",Y(2017,2024),"Седан"),
  m("quattroporte","maserati","Maserati","Quattroporte","quattroporte",Y(2017,2024),"Седан"),
  m("levante","maserati","Maserati","Levante","levante",Y(2017,2024),"Кроссовер"),
  m("grecale","maserati","Maserati","Grecale","grecale",Y(2023,2025),"Кроссовер"),
  m("mc20","maserati","Maserati","MC20","mc20",Y(2022,2025),"Купе"),
  // McLaren
  m("720s","mclaren","McLaren","720S","720s",Y(2018,2023),"Купе"),
  m("artura","mclaren","McLaren","Artura","artura",Y(2023,2025),"Купе"),
  m("gt","mclaren","McLaren","GT","gt",Y(2020,2024),"Купе"),
  // MINI
  m("cooper","mini","MINI","Cooper","cooper",Y(2017,2025),"Хэтчбек"),
  m("countryman","mini","MINI","Countryman","countryman",Y(2018,2025),"Кроссовер"),
  m("clubman","mini","MINI","Clubman","clubman",Y(2017,2024),"Универсал"),
  // Polestar
  m("polestar-2","polestar","Polestar","Polestar 2","polestar-2",Y(2021,2025),"Хэтчбек"),
  m("polestar-3","polestar","Polestar","Polestar 3","polestar-3",Y(2024,2025),"Кроссовер"),
  m("polestar-4","polestar","Polestar","Polestar 4","polestar-4",Y(2025,2025),"Кроссовер"),
  // Ram
  m("ram-1500","ram","Ram","1500","1500",Y(2019,2025),"Пикап"),
  m("ram-2500","ram","Ram","2500","2500",Y(2019,2025),"Пикап"),
  m("ram-3500","ram","Ram","3500","3500",Y(2019,2025),"Пикап"),
  m("promaster","ram","Ram","ProMaster","promaster",Y(2019,2025),"Фургон"),
  // Rivian
  m("r1t","rivian","Rivian","R1T","r1t",Y(2022,2025),"Пикап"),
  m("r1s","rivian","Rivian","R1S","r1s",Y(2023,2025),"Кроссовер"),
  // Rolls-Royce
  m("ghost","rolls-royce","Rolls-Royce","Ghost","ghost",Y(2021,2025),"Седан"),
  m("phantom","rolls-royce","Rolls-Royce","Phantom","phantom",Y(2018,2025),"Седан"),
  m("cullinan","rolls-royce","Rolls-Royce","Cullinan","cullinan",Y(2019,2025),"Внедорожник"),
  m("spectre","rolls-royce","Rolls-Royce","Spectre","spectre",Y(2024,2025),"Купе"),
];

for (const b of brands) {
  b.modelsCount = mockModels.filter((m) => m.brandId === b.id).length;
}

export const badges: Badge[] = brands.map((b) => ({ id: b.id, brandName: b.name }));

export const mockReviews: Review[] = [
  { id: "1", customerName: "Александр М.", carModel: "Toyota Camry 2022", text: "Отличные коврики! Встали идеально, как родные. Качество EVA на высоте — не скользят, легко моются. Рекомендую!", rating: 5, createdAt: "2026-03-15" },
  { id: "2", customerName: "Ирина К.", carModel: "BMW X5 2023", text: "Заказала полный комплект с багажником. Коврики пришли быстро, упаковка надёжная. Смотрятся премиально, золотая окантовка шикарна.", rating: 5, createdAt: "2026-03-10" },
  { id: "3", customerName: "Дмитрий В.", carModel: "Tesla Model Y 2024", text: "Долго искал нормальные коврики для Теслы. Эти — лучшие. Идеальная посадка, не пахнут, выглядят дорого.", rating: 5, createdAt: "2026-02-28" },
];

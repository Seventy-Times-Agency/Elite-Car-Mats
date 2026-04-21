import { Brand, CarModel, EvaColor, EdgeColor, MatSet, Review, Badge } from "@/types";

const brandLogo = (name: string) =>
  `https://vl.imgix.net/img/${name}-logo.png?w=120&h=90&fit=clip&auto=format`;

export const matSets: MatSet[] = [
  { type: "front", label: "Fronts", description: "Driver + passenger" },
  { type: "full", label: "Full Set", description: "Entire cabin" },
  { type: "cargo", label: "Cargo", description: "Trunk / cargo area" },
  { type: "full-cargo", label: "Full Set + Cargo", description: "Cabin and cargo" },
];

export const evaColors: EvaColor[] = [
  { id: "black", name: "Black", hex: "#1A1A1A" },
  { id: "gray", name: "Gray", hex: "#6B7280" },
];

export const edgeColors: EdgeColor[] = [
  { id: "black", name: "Black", hex: "#1A1A1A" },
  { id: "gray", name: "Gray", hex: "#6B7280" },
  { id: "gold", name: "Gold", hex: "#C9A84C" },
  { id: "red", name: "Red", hex: "#DC2626" },
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
  if (bodyType === "Pickup" || bodyType === "Van") return "truck";
  if (bodyType === "Crossover" || bodyType === "SUV") return "suv";
  return "car";
}

function m(id: string, brandId: string, brandName: string, name: string, slug: string, years: number[], bodyType: string): CarModel {
  return { id, brandId, brandName, name, slug, years, bodyType, category: categoryFromBody(bodyType) };
}

export const categoryLabels: Record<VehicleCategory, string> = {
  car: "Cars",
  suv: "SUVs / Crossovers",
  truck: "Pickups / Vans",
};

const Y = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const YY = (...ranges: [number, number][]) => ranges.flatMap(([from, to]) => Y(from, to));

export const mockModels: CarModel[] = [
  // Acura
  m("mdx","acura","Acura","MDX","mdx",Y(2001,2025),"Crossover"),
  m("rdx","acura","Acura","RDX","rdx",Y(2007,2025),"Crossover"),
  m("tlx","acura","Acura","TLX","tlx",Y(2015,2025),"Sedan"),
  m("integra","acura","Acura","Integra","integra",YY([1990,2001],[2023,2025]),"Sedan"),
  m("zdx","acura","Acura","ZDX","zdx",Y(2024,2025),"Crossover"),
  // Audi
  m("a3","audi","Audi","A3","a3",Y(2006,2025),"Sedan"),
  m("a4","audi","Audi","A4","a4",Y(1996,2025),"Sedan"),
  m("a6","audi","Audi","A6","a6",Y(1995,2025),"Sedan"),
  m("q3","audi","Audi","Q3","q3",Y(2015,2025),"Crossover"),
  m("q5","audi","Audi","Q5","q5",Y(2009,2025),"Crossover"),
  m("q7","audi","Audi","Q7","q7",Y(2007,2025),"Crossover"),
  m("q8","audi","Audi","Q8","q8",Y(2019,2025),"Crossover"),
  m("e-tron","audi","Audi","e-tron","e-tron",Y(2021,2025),"Crossover"),
  m("a5","audi","Audi","A5","a5",Y(2008,2025),"Coupe"),
  m("a7","audi","Audi","A7","a7",Y(2012,2025),"Sedan"),
  m("a8","audi","Audi","A8","a8",Y(1997,2025),"Sedan"),
  m("e-tron-gt","audi","Audi","e-tron GT","e-tron-gt",Y(2022,2025),"Sedan"),
  m("q4-e-tron","audi","Audi","Q4 e-tron","q4-e-tron",Y(2022,2025),"Crossover"),
  m("rs6","audi","Audi","RS6","rs6",Y(2013,2025),"Wagon"),
  m("tt","audi","Audi","TT","tt",Y(2000,2023),"Coupe"),
  // BMW
  m("3-series","bmw","BMW","3 Series","3-series",Y(1990,2025),"Sedan"),
  m("5-series","bmw","BMW","5 Series","5-series",Y(1990,2025),"Sedan"),
  m("7-series","bmw","BMW","7 Series","7-series",Y(1990,2025),"Sedan"),
  m("x1","bmw","BMW","X1","x1",Y(2012,2025),"Crossover"),
  m("x3","bmw","BMW","X3","x3",Y(2004,2025),"Crossover"),
  m("x5","bmw","BMW","X5","x5",Y(1999,2025),"Crossover"),
  m("x7","bmw","BMW","X7","x7",Y(2019,2025),"Crossover"),
  m("ix","bmw","BMW","iX","ix",Y(2022,2025),"Crossover"),
  m("2-series","bmw","BMW","2 Series","2-series",Y(2014,2025),"Coupe"),
  m("4-series","bmw","BMW","4 Series","4-series",Y(2014,2025),"Coupe"),
  m("8-series","bmw","BMW","8 Series","8-series",YY([1990,1999],[2019,2025]),"Coupe"),
  m("x2","bmw","BMW","X2","x2",Y(2018,2025),"Crossover"),
  m("x4","bmw","BMW","X4","x4",Y(2015,2025),"Crossover"),
  m("x6","bmw","BMW","X6","x6",Y(2008,2025),"Crossover"),
  m("i4","bmw","BMW","i4","i4",Y(2022,2025),"Sedan"),
  m("i5","bmw","BMW","i5","i5",Y(2024,2025),"Sedan"),
  m("i7","bmw","BMW","i7","i7",Y(2023,2025),"Sedan"),
  m("z4","bmw","BMW","Z4","z4",Y(2019,2025),"Roadster"),
  // Cadillac
  m("escalade","cadillac","Cadillac","Escalade","escalade",Y(1999,2025),"SUV"),
  m("ct5","cadillac","Cadillac","CT5","ct5",Y(2020,2025),"Sedan"),
  m("xt4","cadillac","Cadillac","XT4","xt4",Y(2019,2025),"Crossover"),
  m("xt5","cadillac","Cadillac","XT5","xt5",Y(2017,2025),"Crossover"),
  m("lyriq","cadillac","Cadillac","LYRIQ","lyriq",Y(2023,2025),"Crossover"),
  m("ct4","cadillac","Cadillac","CT4","ct4",Y(2020,2025),"Sedan"),
  m("xt6","cadillac","Cadillac","XT6","xt6",Y(2020,2025),"Crossover"),
  m("celestiq","cadillac","Cadillac","Celestiq","celestiq",Y(2025,2025),"Sedan"),
  // Chevrolet
  m("silverado","chevrolet","Chevrolet","Silverado","silverado",Y(1999,2025),"Pickup"),
  m("equinox","chevrolet","Chevrolet","Equinox","equinox",Y(2005,2025),"Crossover"),
  m("tahoe","chevrolet","Chevrolet","Tahoe","tahoe",Y(1995,2025),"SUV"),
  m("traverse","chevrolet","Chevrolet","Traverse","traverse",Y(2009,2025),"Crossover"),
  m("malibu","chevrolet","Chevrolet","Malibu","malibu",Y(1997,2024),"Sedan"),
  m("blazer","chevrolet","Chevrolet","Blazer","blazer",YY([1990,2005],[2019,2025]),"Crossover"),
  m("suburban","chevrolet","Chevrolet","Suburban","suburban",Y(1990,2025),"SUV"),
  m("corvette","chevrolet","Chevrolet","Corvette","corvette",Y(1990,2025),"Coupe"),
  m("camaro","chevrolet","Chevrolet","Camaro","camaro",YY([1990,2002],[2010,2024]),"Coupe"),
  m("colorado","chevrolet","Chevrolet","Colorado","colorado",Y(2023,2025),"Pickup"),
  m("trailblazer","chevrolet","Chevrolet","Trailblazer","trailblazer",Y(2021,2025),"Crossover"),
  m("trax","chevrolet","Chevrolet","Trax","trax",Y(2024,2025),"Crossover"),
  m("bolt-ev","chevrolet","Chevrolet","Bolt EV","bolt-ev",Y(2019,2023),"Hatchback"),
  // Chrysler
  m("pacifica","chrysler","Chrysler","Pacifica","pacifica",Y(2017,2025),"Minivan"),
  m("300","chrysler","Chrysler","300","300",Y(2005,2023),"Sedan"),
  m("voyager","chrysler","Chrysler","Voyager","voyager",YY([1990,2003],[2020,2022]),"Minivan"),
  // Dodge
  m("durango","dodge","Dodge","Durango","durango",Y(1998,2025),"Crossover"),
  m("challenger","dodge","Dodge","Challenger","challenger",Y(2008,2023),"Coupe"),
  m("charger","dodge","Dodge","Charger","charger",Y(2006,2025),"Sedan"),
  m("hornet","dodge","Dodge","Hornet","hornet",Y(2023,2025),"Crossover"),
  // Ford
  m("f-150","ford","Ford","F-150","f-150",Y(1990,2025),"Pickup"),
  m("explorer","ford","Ford","Explorer","explorer",Y(1991,2025),"Crossover"),
  m("escape","ford","Ford","Escape","escape",Y(2001,2025),"Crossover"),
  m("edge","ford","Ford","Edge","edge",Y(2007,2024),"Crossover"),
  m("bronco","ford","Ford","Bronco","bronco",YY([1990,1996],[2021,2025]),"SUV"),
  m("mustang","ford","Ford","Mustang","mustang",Y(1990,2025),"Coupe"),
  m("maverick","ford","Ford","Maverick","maverick",Y(2022,2025),"Pickup"),
  m("expedition","ford","Ford","Expedition","expedition",Y(1997,2025),"SUV"),
  m("ranger","ford","Ford","Ranger","ranger",YY([1990,2011],[2019,2025]),"Pickup"),
  m("mustang-mach-e","ford","Ford","Mustang Mach-E","mustang-mach-e",Y(2021,2025),"Crossover"),
  m("transit","ford","Ford","Transit","transit",Y(2020,2025),"Van"),
  m("transit-connect","ford","Ford","Transit Connect","transit-connect",Y(2019,2023),"Van"),
  // GMC
  m("sierra","gmc","GMC","Sierra","sierra",Y(1999,2025),"Pickup"),
  m("yukon","gmc","GMC","Yukon","yukon",Y(1992,2025),"SUV"),
  m("terrain","gmc","GMC","Terrain","terrain",Y(2010,2025),"Crossover"),
  m("acadia","gmc","GMC","Acadia","acadia",Y(2007,2025),"Crossover"),
  m("canyon","gmc","GMC","Canyon","canyon",Y(2004,2025),"Pickup"),
  m("hummer-ev","gmc","GMC","Hummer EV","hummer-ev",Y(2022,2025),"Pickup"),
  m("yukon-xl","gmc","GMC","Yukon XL","yukon-xl",Y(2021,2025),"SUV"),
  // Honda
  m("civic","honda","Honda","Civic","civic",Y(1990,2025),"Sedan"),
  m("accord","honda","Honda","Accord","accord",Y(1990,2025),"Sedan"),
  m("cr-v","honda","Honda","CR-V","cr-v",Y(1997,2025),"Crossover"),
  m("hr-v","honda","Honda","HR-V","hr-v",Y(2016,2025),"Crossover"),
  m("pilot","honda","Honda","Pilot","pilot",Y(2003,2025),"Crossover"),
  m("odyssey","honda","Honda","Odyssey","odyssey",Y(1995,2025),"Minivan"),
  m("ridgeline","honda","Honda","Ridgeline","ridgeline",YY([2006,2014],[2017,2025]),"Pickup"),
  m("passport","honda","Honda","Passport","passport",Y(2019,2025),"Crossover"),
  m("prologue","honda","Honda","Prologue","prologue",Y(2024,2025),"Crossover"),
  // Hyundai
  m("tucson","hyundai","Hyundai","Tucson","tucson",Y(2005,2025),"Crossover"),
  m("santa-fe","hyundai","Hyundai","Santa Fe","santa-fe",Y(2001,2025),"Crossover"),
  m("elantra","hyundai","Hyundai","Elantra","elantra",Y(1992,2025),"Sedan"),
  m("sonata","hyundai","Hyundai","Sonata","sonata",Y(1990,2025),"Sedan"),
  m("palisade","hyundai","Hyundai","Palisade","palisade",Y(2020,2025),"Crossover"),
  m("kona","hyundai","Hyundai","Kona","kona",Y(2018,2025),"Crossover"),
  m("ioniq-5","hyundai","Hyundai","Ioniq 5","ioniq-5",Y(2022,2025),"Crossover"),
  m("ioniq-6","hyundai","Hyundai","Ioniq 6","ioniq-6",Y(2023,2025),"Sedan"),
  m("venue","hyundai","Hyundai","Venue","venue",Y(2020,2025),"Crossover"),
  m("santa-cruz","hyundai","Hyundai","Santa Cruz","santa-cruz",Y(2022,2025),"Pickup"),
  // Infiniti
  m("q50","infiniti","Infiniti","Q50","q50",Y(2014,2025),"Sedan"),
  m("q60","infiniti","Infiniti","Q60","q60",Y(2017,2024),"Coupe"),
  m("qx50","infiniti","Infiniti","QX50","qx50",Y(2014,2025),"Crossover"),
  m("qx60","infiniti","Infiniti","QX60","qx60",Y(2014,2025),"Crossover"),
  // Jeep
  m("wrangler","jeep","Jeep","Wrangler","wrangler",Y(1990,2025),"SUV"),
  m("grand-cherokee","jeep","Jeep","Grand Cherokee","grand-cherokee",Y(1993,2025),"Crossover"),
  m("cherokee","jeep","Jeep","Cherokee","cherokee",Y(1990,2023),"Crossover"),
  m("compass","jeep","Jeep","Compass","compass",Y(2007,2025),"Crossover"),
  m("gladiator","jeep","Jeep","Gladiator","gladiator",Y(2020,2025),"Pickup"),
  m("wagoneer","jeep","Jeep","Wagoneer","wagoneer",YY([1990,1991],[2022,2025]),"SUV"),
  m("grand-wagoneer","jeep","Jeep","Grand Wagoneer","grand-wagoneer",YY([1990,1991],[2022,2025]),"SUV"),
  m("renegade","jeep","Jeep","Renegade","renegade",Y(2015,2023),"Crossover"),
  // Kia
  m("sportage","kia","Kia","Sportage","sportage",Y(1995,2025),"Crossover"),
  m("k5","kia","Kia","K5","k5",Y(2021,2025),"Sedan"),
  m("telluride","kia","Kia","Telluride","telluride",Y(2020,2025),"Crossover"),
  m("sorento","kia","Kia","Sorento","sorento",Y(2003,2025),"Crossover"),
  m("forte","kia","Kia","Forte","forte",Y(2010,2025),"Sedan"),
  m("seltos","kia","Kia","Seltos","seltos",Y(2021,2025),"Crossover"),
  m("ev6","kia","Kia","EV6","ev6",Y(2022,2025),"Crossover"),
  m("niro","kia","Kia","Niro","niro",Y(2023,2025),"Crossover"),
  m("carnival","kia","Kia","Carnival","carnival",Y(2022,2025),"Minivan"),
  m("soul","kia","Kia","Soul","soul",Y(2010,2025),"Hatchback"),
  m("ev9","kia","Kia","EV9","ev9",Y(2024,2025),"Crossover"),
  // Lexus
  m("rx","lexus","Lexus","RX","rx",Y(1999,2025),"Crossover"),
  m("es","lexus","Lexus","ES","es",Y(1990,2025),"Sedan"),
  m("nx","lexus","Lexus","NX","nx",Y(2015,2025),"Crossover"),
  m("is","lexus","Lexus","IS","is",Y(2001,2025),"Sedan"),
  m("gx","lexus","Lexus","GX","gx",Y(2003,2025),"SUV"),
  m("tx","lexus","Lexus","TX","tx",Y(2024,2025),"Crossover"),
  m("lx","lexus","Lexus","LX","lx",Y(1996,2025),"SUV"),
  m("lc","lexus","Lexus","LC","lc",Y(2018,2025),"Coupe"),
  m("ls","lexus","Lexus","LS","ls",Y(1990,2025),"Sedan"),
  m("ux","lexus","Lexus","UX","ux",Y(2019,2025),"Crossover"),
  m("rc","lexus","Lexus","RC","rc",Y(2015,2024),"Coupe"),
  m("rz","lexus","Lexus","RZ","rz",Y(2023,2025),"Crossover"),
  // Lincoln
  m("aviator","lincoln","Lincoln","Aviator","aviator",Y(2020,2025),"Crossover"),
  m("corsair","lincoln","Lincoln","Corsair","corsair",Y(2020,2025),"Crossover"),
  m("nautilus","lincoln","Lincoln","Nautilus","nautilus",Y(2019,2025),"Crossover"),
  m("navigator","lincoln","Lincoln","Navigator","navigator",Y(1998,2025),"SUV"),
  // Mazda
  m("cx-5","mazda","Mazda","CX-5","cx-5",Y(2013,2025),"Crossover"),
  m("cx-50","mazda","Mazda","CX-50","cx-50",Y(2023,2025),"Crossover"),
  m("cx-90","mazda","Mazda","CX-90","cx-90",Y(2024,2025),"Crossover"),
  m("mazda3","mazda","Mazda","Mazda3","mazda3",Y(2004,2025),"Sedan"),
  m("mx-5","mazda","Mazda","MX-5","mx-5",Y(1990,2025),"Roadster"),
  // Mercedes-Benz
  m("c-class","mercedes","Mercedes-Benz","C-Class","c-class",Y(1994,2025),"Sedan"),
  m("e-class","mercedes","Mercedes-Benz","E-Class","e-class",Y(1990,2025),"Sedan"),
  m("s-class","mercedes","Mercedes-Benz","S-Class","s-class",Y(1990,2025),"Sedan"),
  m("gle","mercedes","Mercedes-Benz","GLE","gle",Y(1997,2025),"Crossover"),
  m("glc","mercedes","Mercedes-Benz","GLC","glc",Y(2008,2025),"Crossover"),
  m("gla","mercedes","Mercedes-Benz","GLA","gla",Y(2014,2025),"Crossover"),
  m("glb","mercedes","Mercedes-Benz","GLB","glb",Y(2020,2025),"Crossover"),
  m("gls","mercedes","Mercedes-Benz","GLS","gls",Y(2007,2025),"SUV"),
  m("g-class","mercedes","Mercedes-Benz","G-Class","g-class",Y(1990,2025),"SUV"),
  m("cla","mercedes","Mercedes-Benz","CLA","cla",Y(2020,2025),"Sedan"),
  m("cls","mercedes","Mercedes-Benz","CLS","cls",Y(2019,2023),"Sedan"),
  m("eqs","mercedes","Mercedes-Benz","EQS","eqs",Y(2022,2025),"Sedan"),
  m("eqe","mercedes","Mercedes-Benz","EQE","eqe",Y(2023,2025),"Sedan"),
  m("eqb","mercedes","Mercedes-Benz","EQB","eqb",Y(2023,2025),"Crossover"),
  m("sprinter","mercedes","Mercedes-Benz","Sprinter","sprinter",Y(2019,2025),"Van"),
  // Mitsubishi
  m("outlander","mitsubishi","Mitsubishi","Outlander","outlander",Y(2003,2025),"Crossover"),
  m("eclipse-cross","mitsubishi","Mitsubishi","Eclipse Cross","eclipse-cross",Y(2018,2025),"Crossover"),
  m("outlander-sport","mitsubishi","Mitsubishi","Outlander Sport","outlander-sport",Y(2011,2025),"Crossover"),
  // Nissan
  m("altima","nissan","Nissan","Altima","altima",Y(1993,2025),"Sedan"),
  m("rogue","nissan","Nissan","Rogue","rogue",Y(2008,2025),"Crossover"),
  m("sentra","nissan","Nissan","Sentra","sentra",Y(1990,2025),"Sedan"),
  m("pathfinder","nissan","Nissan","Pathfinder","pathfinder",Y(1990,2025),"Crossover"),
  m("murano","nissan","Nissan","Murano","murano",Y(2003,2024),"Crossover"),
  m("frontier","nissan","Nissan","Frontier","frontier",Y(1998,2025),"Pickup"),
  m("kicks","nissan","Nissan","Kicks","kicks",Y(2018,2025),"Crossover"),
  m("maxima","nissan","Nissan","Maxima","maxima",Y(1990,2023),"Sedan"),
  m("armada","nissan","Nissan","Armada","armada",Y(2004,2025),"SUV"),
  m("titan","nissan","Nissan","Titan","titan",Y(2004,2024),"Pickup"),
  m("leaf","nissan","Nissan","Leaf","leaf",Y(2011,2025),"Hatchback"),
  m("ariya","nissan","Nissan","Ariya","ariya",Y(2023,2025),"Crossover"),
  m("z","nissan","Nissan","Z","z",Y(1990,2025),"Coupe"),
  // Porsche
  m("cayenne","porsche","Porsche","Cayenne","cayenne",Y(2003,2025),"Crossover"),
  m("macan","porsche","Porsche","Macan","macan",Y(2015,2025),"Crossover"),
  m("911","porsche","Porsche","911","911",Y(1990,2025),"Coupe"),
  m("taycan","porsche","Porsche","Taycan","taycan",Y(2020,2025),"Sedan"),
  m("panamera","porsche","Porsche","Panamera","panamera",Y(2010,2025),"Sedan"),
  // Subaru
  m("outback","subaru","Subaru","Outback","outback",Y(1996,2025),"Wagon"),
  m("forester","subaru","Subaru","Forester","forester",Y(1998,2025),"Crossover"),
  m("crosstrek","subaru","Subaru","Crosstrek","crosstrek",Y(2013,2025),"Crossover"),
  m("impreza","subaru","Subaru","Impreza","impreza",Y(1993,2025),"Sedan"),
  m("ascent","subaru","Subaru","Ascent","ascent",Y(2019,2025),"Crossover"),
  m("legacy","subaru","Subaru","Legacy","legacy",Y(1990,2025),"Sedan"),
  m("brz","subaru","Subaru","BRZ","brz",Y(2013,2025),"Coupe"),
  m("wrx","subaru","Subaru","WRX","wrx",Y(2002,2025),"Sedan"),
  m("solterra","subaru","Subaru","Solterra","solterra",Y(2023,2025),"Crossover"),
  // Tesla
  m("model-3","tesla","Tesla","Model 3","model-3",Y(2018,2025),"Sedan"),
  m("model-y","tesla","Tesla","Model Y","model-y",Y(2021,2025),"Crossover"),
  m("model-s","tesla","Tesla","Model S","model-s",Y(2016,2025),"Sedan"),
  m("model-x","tesla","Tesla","Model X","model-x",Y(2016,2025),"Crossover"),
  m("cybertruck","tesla","Tesla","Cybertruck","cybertruck",Y(2024,2025),"Pickup"),
  // Toyota
  m("camry","toyota","Toyota","Camry","camry",Y(1990,2025),"Sedan"),
  m("rav4","toyota","Toyota","RAV4","rav4",Y(1996,2025),"Crossover"),
  m("corolla","toyota","Toyota","Corolla","corolla",Y(1990,2025),"Sedan"),
  m("highlander","toyota","Toyota","Highlander","highlander",Y(2001,2025),"Crossover"),
  m("tacoma","toyota","Toyota","Tacoma","tacoma",Y(1995,2025),"Pickup"),
  m("tundra","toyota","Toyota","Tundra","tundra",Y(2000,2025),"Pickup"),
  m("4runner","toyota","Toyota","4Runner","4runner",Y(1990,2025),"SUV"),
  m("sienna","toyota","Toyota","Sienna","sienna",Y(1998,2025),"Minivan"),
  m("venza","toyota","Toyota","Venza","venza",Y(2009,2015),"Crossover"),
  m("prius","toyota","Toyota","Prius","prius",Y(2001,2025),"Hatchback"),
  m("supra","toyota","Toyota","Supra","supra",YY([1990,2002],[2020,2025]),"Coupe"),
  m("gr86","toyota","Toyota","GR86","gr86",Y(2022,2025),"Coupe"),
  m("gr-corolla","toyota","Toyota","GR Corolla","gr-corolla",Y(2023,2025),"Hatchback"),
  m("crown","toyota","Toyota","Crown","crown",Y(2023,2025),"Sedan"),
  m("sequoia","toyota","Toyota","Sequoia","sequoia",Y(2023,2025),"SUV"),
  m("land-cruiser","toyota","Toyota","Land Cruiser","land-cruiser",Y(2024,2025),"SUV"),
  m("bz4x","toyota","Toyota","bZ4X","bz4x",Y(2023,2025),"Crossover"),
  m("mirai","toyota","Toyota","Mirai","mirai",Y(2021,2025),"Sedan"),
  // Volkswagen
  m("tiguan","volkswagen","Volkswagen","Tiguan","tiguan",Y(2009,2025),"Crossover"),
  m("atlas","volkswagen","Volkswagen","Atlas","atlas",Y(2018,2025),"Crossover"),
  m("jetta","volkswagen","Volkswagen","Jetta","jetta",Y(1990,2025),"Sedan"),
  m("taos","volkswagen","Volkswagen","Taos","taos",Y(2022,2025),"Crossover"),
  m("id4","volkswagen","Volkswagen","ID.4","id4",Y(2021,2025),"Crossover"),
  m("golf","volkswagen","Volkswagen","Golf","golf",Y(1990,2025),"Hatchback"),
  // Volvo
  m("xc90","volvo","Volvo","XC90","xc90",Y(2003,2025),"Crossover"),
  m("xc60","volvo","Volvo","XC60","xc60",Y(2010,2025),"Crossover"),
  m("xc40","volvo","Volvo","XC40","xc40",Y(2019,2025),"Crossover"),
  m("s60","volvo","Volvo","S60","s60",Y(2001,2025),"Sedan"),
  m("v60","volvo","Volvo","V60","v60",Y(2011,2025),"Wagon"),
  m("s90","volvo","Volvo","S90","s90",YY([1997,1998],[2017,2025]),"Sedan"),
  m("v90","volvo","Volvo","V90","v90",YY([1997,1998],[2017,2024]),"Wagon"),
  m("ex30","volvo","Volvo","EX30","ex30",Y(2024,2025),"Crossover"),
  m("ex90","volvo","Volvo","EX90","ex90",Y(2024,2025),"Crossover"),
  // Alfa Romeo
  m("giulia","alfa-romeo","Alfa Romeo","Giulia","giulia",Y(2017,2025),"Sedan"),
  m("stelvio","alfa-romeo","Alfa Romeo","Stelvio","stelvio",Y(2018,2025),"Crossover"),
  m("tonale","alfa-romeo","Alfa Romeo","Tonale","tonale",Y(2024,2025),"Crossover"),
  // Aston Martin
  m("db11","aston-martin","Aston Martin","DB11","db11",Y(2017,2023),"Coupe"),
  m("db12","aston-martin","Aston Martin","DB12","db12",Y(2024,2025),"Coupe"),
  m("dbx","aston-martin","Aston Martin","DBX","dbx",Y(2021,2025),"Crossover"),
  m("vantage","aston-martin","Aston Martin","Vantage","vantage",Y(2019,2025),"Coupe"),
  // Bentley
  m("continental-gt","bentley","Bentley","Continental GT","continental-gt",Y(2003,2025),"Coupe"),
  m("flying-spur","bentley","Bentley","Flying Spur","flying-spur",Y(2005,2025),"Sedan"),
  m("bentayga","bentley","Bentley","Bentayga","bentayga",Y(2016,2025),"Crossover"),
  // Buick
  m("enclave","buick","Buick","Enclave","enclave",Y(2018,2025),"Crossover"),
  m("encore-gx","buick","Buick","Encore GX","encore-gx",Y(2020,2025),"Crossover"),
  m("envision","buick","Buick","Envision","envision",Y(2021,2025),"Crossover"),
  m("envista","buick","Buick","Envista","envista",Y(2024,2025),"Crossover"),
  // Fiat
  m("500","fiat","Fiat","500","500",Y(2012,2019),"Hatchback"),
  m("500x","fiat","Fiat","500X","500x",Y(2016,2023),"Crossover"),
  m("500e","fiat","Fiat","500e","500e",YY([2013,2019],[2024,2025]),"Hatchback"),
  // Genesis
  m("g70","genesis","Genesis","G70","g70",Y(2019,2025),"Sedan"),
  m("g80","genesis","Genesis","G80","g80",Y(2021,2025),"Sedan"),
  m("g90","genesis","Genesis","G90","g90",Y(2023,2025),"Sedan"),
  m("gv60","genesis","Genesis","GV60","gv60",Y(2023,2025),"Crossover"),
  m("gv70","genesis","Genesis","GV70","gv70",Y(2022,2025),"Crossover"),
  m("gv80","genesis","Genesis","GV80","gv80",Y(2021,2025),"Crossover"),
  // Jaguar
  m("f-pace","jaguar","Jaguar","F-Pace","f-pace",Y(2017,2025),"Crossover"),
  m("e-pace","jaguar","Jaguar","E-Pace","e-pace",Y(2018,2025),"Crossover"),
  m("i-pace","jaguar","Jaguar","I-Pace","i-pace",Y(2019,2024),"Crossover"),
  m("xf","jaguar","Jaguar","XF","xf",Y(2009,2025),"Sedan"),
  // Lamborghini
  m("urus","lamborghini","Lamborghini","Urus","urus",Y(2019,2025),"Crossover"),
  m("huracan","lamborghini","Lamborghini","Huracán","huracan",Y(2014,2024),"Coupe"),
  m("revuelto","lamborghini","Lamborghini","Revuelto","revuelto",Y(2024,2025),"Coupe"),
  // Land Rover
  m("defender","land-rover","Land Rover","Defender","defender",YY([1990,1997],[2020,2025]),"SUV"),
  m("discovery","land-rover","Land Rover","Discovery","discovery",Y(1994,2025),"SUV"),
  m("discovery-sport","land-rover","Land Rover","Discovery Sport","discovery-sport",Y(2015,2025),"Crossover"),
  m("range-rover","land-rover","Land Rover","Range Rover","range-rover",Y(1990,2025),"SUV"),
  m("range-rover-sport","land-rover","Land Rover","Range Rover Sport","range-rover-sport",Y(2006,2025),"SUV"),
  m("range-rover-velar","land-rover","Land Rover","Range Rover Velar","range-rover-velar",Y(2018,2025),"Crossover"),
  m("range-rover-evoque","land-rover","Land Rover","Range Rover Evoque","range-rover-evoque",Y(2012,2025),"Crossover"),
  // Lucid
  m("air","lucid","Lucid","Air","air",Y(2022,2025),"Sedan"),
  m("gravity","lucid","Lucid","Gravity","gravity",Y(2025,2025),"Crossover"),
  // Maserati
  m("ghibli","maserati","Maserati","Ghibli","ghibli",Y(2014,2024),"Sedan"),
  m("quattroporte","maserati","Maserati","Quattroporte","quattroporte",Y(2005,2024),"Sedan"),
  m("levante","maserati","Maserati","Levante","levante",Y(2017,2024),"Crossover"),
  m("grecale","maserati","Maserati","Grecale","grecale",Y(2023,2025),"Crossover"),
  m("mc20","maserati","Maserati","MC20","mc20",Y(2022,2025),"Coupe"),
  // McLaren
  m("720s","mclaren","McLaren","720S","720s",Y(2018,2023),"Coupe"),
  m("artura","mclaren","McLaren","Artura","artura",Y(2023,2025),"Coupe"),
  m("gt","mclaren","McLaren","GT","gt",Y(2020,2024),"Coupe"),
  // MINI
  m("cooper","mini","MINI","Cooper","cooper",Y(2002,2025),"Hatchback"),
  m("countryman","mini","MINI","Countryman","countryman",Y(2011,2025),"Crossover"),
  m("clubman","mini","MINI","Clubman","clubman",Y(2008,2024),"Wagon"),
  // Polestar
  m("polestar-2","polestar","Polestar","Polestar 2","polestar-2",Y(2021,2025),"Hatchback"),
  m("polestar-3","polestar","Polestar","Polestar 3","polestar-3",Y(2024,2025),"Crossover"),
  m("polestar-4","polestar","Polestar","Polestar 4","polestar-4",Y(2025,2025),"Crossover"),
  // Ram
  m("ram-1500","ram","Ram","1500","1500",Y(1994,2025),"Pickup"),
  m("ram-2500","ram","Ram","2500","2500",Y(1994,2025),"Pickup"),
  m("ram-3500","ram","Ram","3500","3500",Y(1994,2025),"Pickup"),
  m("promaster","ram","Ram","ProMaster","promaster",Y(2014,2025),"Van"),
  // Rivian
  m("r1t","rivian","Rivian","R1T","r1t",Y(2022,2025),"Pickup"),
  m("r1s","rivian","Rivian","R1S","r1s",Y(2023,2025),"Crossover"),
  // Rolls-Royce
  m("ghost","rolls-royce","Rolls-Royce","Ghost","ghost",Y(2010,2025),"Sedan"),
  m("phantom","rolls-royce","Rolls-Royce","Phantom","phantom",Y(2003,2025),"Sedan"),
  m("cullinan","rolls-royce","Rolls-Royce","Cullinan","cullinan",Y(2019,2025),"SUV"),
  m("spectre","rolls-royce","Rolls-Royce","Spectre","spectre",Y(2024,2025),"Coupe"),
];

for (const b of brands) {
  b.modelsCount = mockModels.filter((m) => m.brandId === b.id).length;
}

export const badges: Badge[] = brands.map((b) => ({ id: b.id, brandName: b.name }));

export const mockReviews: Review[] = [
  { id: "1", customerName: "Alex M.", carModel: "Toyota Camry 2022", text: "Fantastic mats! They fit like factory originals. The EVA quality is top-notch — non-slip and easy to clean. Highly recommend!", rating: 5, createdAt: "2026-03-15" },
  { id: "2", customerName: "Irene K.", carModel: "BMW X5 2023", text: "Ordered the full set plus cargo. Mats arrived quickly, packaging was solid. They look premium — the gold edging is gorgeous.", rating: 5, createdAt: "2026-03-10" },
  { id: "3", customerName: "Dmitry V.", carModel: "Tesla Model Y 2024", text: "Searched a long time for decent mats for the Tesla. These are the best. Perfect fit, odorless, and they look expensive.", rating: 5, createdAt: "2026-02-28" },
];

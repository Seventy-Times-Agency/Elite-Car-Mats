import { MatSet, VehicleCategory } from "@/types";

export const matSets: MatSet[] = [
  { type: "front", label: "Передние", description: "Водитель + пассажир" },
  { type: "full", label: "Полный комплект", description: "Весь салон" },
  { type: "cargo", label: "Багажник", description: "Багажное отделение" },
  { type: "full-cargo", label: "Полный + Багажник", description: "Салон и багажник" },
];

export const categoryLabels: Record<VehicleCategory, string> = {
  car: "Легковые",
  suv: "SUV / Кроссоверы",
  truck: "Пикапы / Фургоны",
  commercial: "Коммерческие / Фуры",
};

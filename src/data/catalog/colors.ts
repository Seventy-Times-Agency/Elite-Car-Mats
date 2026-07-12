import { EvaColor, EdgeColor } from "@/types";

// Approved supplier palette (photo samples, July 2026).
// Names are the canonical Russian strings — they double as lookup keys in
// i18n/labels.ts COLOR_KEY, so a rename here needs a matching entry there.

// Display order = dark neutrals → accents → light neutrals, so the
// swatch rows in the configurator read as a smooth gradient.

export const evaColors: EvaColor[] = [
  { id: "black", name: "Чёрный", hex: "#26282E" },
  { id: "gray", name: "Серый", hex: "#545965" },
  { id: "brown", name: "Коричневый", hex: "#6B5D57" },
  { id: "beige", name: "Бежевый", hex: "#C4BBAA" },
  { id: "red", name: "Красный", hex: "#CE4450" },
];

export const edgeColors: EdgeColor[] = [
  { id: "black", name: "Чёрный", hex: "#1C1C1F" },
  { id: "dark-brown", name: "Тёмно-коричневый", hex: "#43362F" },
  { id: "navy", name: "Тёмно-синий", hex: "#283052" },
  { id: "dark-green", name: "Тёмно-зелёный", hex: "#444B3A" },
  { id: "purple", name: "Фиолетовый", hex: "#5A4CCC" },
  { id: "red", name: "Красный", hex: "#E5423F" },
  { id: "yellow", name: "Жёлтый", hex: "#F2DE3C" },
  { id: "beige", name: "Бежевый", hex: "#D7B896" },
  { id: "ivory", name: "Кремовый", hex: "#EAE6CD" },
  { id: "light-gray", name: "Светло-серый", hex: "#C2C6CC" },
  { id: "white", name: "Белый", hex: "#F2F3F5" },
];

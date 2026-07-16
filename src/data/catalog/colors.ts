import { EvaColor, EdgeColor } from "@/types";

// Approved supplier palette (photo samples, July 2026).
// Names are the canonical Russian strings — they double as lookup keys in
// i18n/labels.ts COLOR_KEY, so a rename here needs a matching entry there.

// Display order = dark neutrals → accents → light neutrals, so the
// swatch rows in the configurator read as a smooth gradient.

// Hex values sampled from the real supplier swatch photos (the same
// shots that back the configurator texture swatches), tuned for
// vibrancy so the small hex-only displays (mat-preview schematic, cart
// dots, order page) match how the material actually looks — the earlier
// values read noticeably duller than the fabric.
export const evaColors: EvaColor[] = [
  { id: "black", name: "Чёрный", hex: "#2B2C30" },
  { id: "gray", name: "Серый", hex: "#5B5E64" },
  { id: "brown", name: "Коричневый", hex: "#6E4E40" },
  { id: "beige", name: "Бежевый", hex: "#CBBC9E" },
  { id: "red", name: "Красный", hex: "#C81E24" },
];

export const edgeColors: EdgeColor[] = [
  { id: "black", name: "Чёрный", hex: "#1F2022" },
  { id: "dark-brown", name: "Тёмно-коричневый", hex: "#3E312C" },
  { id: "navy", name: "Тёмно-синий", hex: "#1E2745" },
  { id: "dark-green", name: "Тёмно-зелёный", hex: "#39402B" },
  { id: "purple", name: "Фиолетовый", hex: "#5E3EA6" },
  { id: "red", name: "Красный", hex: "#D0202A" },
  { id: "yellow", name: "Жёлтый", hex: "#F4D91A" },
  { id: "beige", name: "Бежевый", hex: "#D7B291" },
  { id: "ivory", name: "Кремовый", hex: "#E4DDC4" },
  { id: "light-gray", name: "Светло-серый", hex: "#BEC1C6" },
  { id: "white", name: "Белый", hex: "#EDEBEF" },
];

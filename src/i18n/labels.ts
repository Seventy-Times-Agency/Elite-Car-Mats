// Maps Russian body-type / mat-set / color strings (as stored in mock data and
// the DB) to dictionary keys so they can be rendered localized.
import type { TFn } from "./dictionary";

const BODY_KEY: Record<string, string> = {
  Седан: "body.sedan",
  Кроссовер: "body.crossover",
  Внедорожник: "body.suv",
  Пикап: "body.pickup",
  Купе: "body.coupe",
  Универсал: "body.wagon",
  Хэтчбек: "body.hatchback",
  Родстер: "body.roadster",
  Минивэн: "body.minivan",
  Фургон: "body.van",
  "Седельный тягач": "body.semitruck",
  Грузовик: "body.truckBody",
};

const MATSET_KEY: Record<string, string> = {
  // Sedan / SUV / minivan / pickup cabin
  "Перед + зад": "matset.cabin",
  "Полный комплект": "matset.fullCargo",
  "Только багажник": "matset.cargo",
  // Two-seaters
  "Только первый ряд": "matset.frontOnly",
  "Всё вместе": "matset.everything",
  // Semi-truck cabin
  Кабина: "matset.semiCabin",
  // Minivan-specific
  "Перед + середина": "matset.minivanFrontMid",
  "Перед + середина + зад": "matset.minivanThreeRow",
  // Legacy labels — kept so old cart entries still localize cleanly
  Передние: "matset.fronts",
  Багажник: "matset.cargo",
  "Полный + Багажник": "matset.fullCargo",
  "Кузов пикапа": "matset.cabin",
  "Полный + Кузов": "matset.fullCargo",
};

const MATSET_DESC_KEY: Record<string, string> = {
  "Водитель + пассажир": "matset.frontOnlyDesc",
  "Весь салон (4 коврика)": "matset.cabinDesc",
  "Багажное отделение": "matset.cargoDesc",
  "Салон и багажник": "matset.fullCargoDesc",
  "Все три ряда + багажник": "matset.minivanFullDesc",
  "Все три ряда сидений": "matset.minivanThreeRowDesc",
  "1-й и 2-й ряд": "matset.minivanFrontMidDesc",
  "Большой комплект в кабину тягача": "matset.semiCabinDesc",
  // Legacy descriptions
  "Весь салон": "matset.cabinDesc",
  "Большой коврик в открытый кузов": "matset.cabinDesc",
  "Салон и кузов пикапа": "matset.fullCargoDesc",
};

const COLOR_KEY: Record<string, string> = {
  Чёрный: "color.black",
  Серый: "color.gray",
  "Тёмно-серый": "color.darkGray",
  "Светло-серый": "color.lightGray",
  Золотой: "color.gold",
  Красный: "color.red",
  Бордовый: "color.wine",
  Синий: "color.blue",
  Коричневый: "color.brown",
  Бежевый: "color.beige",
  Жёлтый: "color.yellow",
  Зелёный: "color.green",
  Фиолетовый: "color.purple",
  Оранжевый: "color.orange",
  Белый: "color.white",
};

function lookup(t: TFn, key: string | undefined, fallback: string): string {
  if (!key) return fallback;
  const v = t.raw(key);
  return typeof v === "string" ? v : fallback;
}

export function localizeBody(t: TFn, body: string): string {
  return lookup(t, BODY_KEY[body], body);
}

export function localizeMatSet(t: TFn, label: string): string {
  return lookup(t, MATSET_KEY[label], label);
}

export function localizeMatSetDesc(t: TFn, desc: string): string {
  return lookup(t, MATSET_DESC_KEY[desc], desc);
}

export function localizeColor(t: TFn, name: string): string {
  return lookup(t, COLOR_KEY[name], name);
}

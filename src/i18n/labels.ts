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
  Передние: "matset.fronts",
  "Полный комплект": "matset.full",
  Багажник: "matset.cargo",
  "Полный + Багажник": "matset.fullCargo",
  "Кузов пикапа": "matset.cargoTruck",
  "Полный + Кузов": "matset.fullCargoTruck",
};

const MATSET_DESC_KEY: Record<string, string> = {
  "Водитель + пассажир": "matset.frontsDesc",
  "Весь салон": "matset.fullDesc",
  "Багажное отделение": "matset.cargoDesc",
  "Салон и багажник": "matset.fullCargoDesc",
  "Большой коврик в открытый кузов": "matset.cargoTruckDesc",
  "Салон и кузов пикапа": "matset.fullCargoTruckDesc",
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

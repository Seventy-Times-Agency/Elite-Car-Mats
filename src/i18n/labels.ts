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
};

const MATSET_KEY: Record<string, string> = {
  Передние: "matset.fronts",
  "Полный комплект": "matset.full",
  Багажник: "matset.cargo",
  "Полный + Багажник": "matset.fullCargo",
};

const MATSET_DESC_KEY: Record<string, string> = {
  "Водитель + пассажир": "matset.frontsDesc",
  "Весь салон": "matset.fullDesc",
  "Багажное отделение": "matset.cargoDesc",
  "Салон и багажник": "matset.fullCargoDesc",
};

const COLOR_KEY: Record<string, string> = {
  Чёрный: "color.black",
  Серый: "color.gray",
  Золотой: "color.gold",
  Красный: "color.red",
};

export function localizeBody(t: TFn, body: string): string {
  const key = BODY_KEY[body];
  return key ? t(key, body) : body;
}

export function localizeMatSet(t: TFn, label: string): string {
  const key = MATSET_KEY[label];
  return key ? t(key, label) : label;
}

export function localizeMatSetDesc(t: TFn, desc: string): string {
  const key = MATSET_DESC_KEY[desc];
  return key ? t(key, desc) : desc;
}

export function localizeColor(t: TFn, name: string): string {
  const key = COLOR_KEY[name];
  return key ? t(key, name) : name;
}

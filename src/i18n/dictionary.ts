// Flat-key dictionary shape. Keys use dot notation like "nav.catalog".
// Values can be strings, string arrays, or functions of arbitrary args.
export type DictValue = string | string[] | ((...args: never[]) => string);
export type Dict = Record<string, DictValue>;

export interface TFn {
  // Plain string lookup (stringifies if the stored value is not a string).
  (key: string, fallback?: string): string;
  // Raw lookup returning the stored value as-is (string | array | function).
  raw: (key: string) => DictValue | undefined;
}

export function makeT(dict: Dict, fallbackDict: Dict): TFn {
  const get = (key: string): DictValue | undefined => {
    if (key in dict) return dict[key];
    if (key in fallbackDict) return fallbackDict[key];
    return undefined;
  };
  const tFn = (key: string, fallback?: string): string => {
    const v = get(key);
    if (typeof v === "string") return v;
    if (fallback !== undefined) return fallback;
    if (v === undefined && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] missing key: ${key}`);
    }
    return typeof v === "string" ? v : key;
  };
  const t = tFn as TFn;
  t.raw = get;
  return t;
}

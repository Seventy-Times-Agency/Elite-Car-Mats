// Flat-key dictionary shape. Keys use dot notation like "nav.catalog".
// Only plain strings allowed (dicts cross the server/client boundary during
// SSR so functions would fail to serialize). For parameterized strings use
// placeholders like "{count}" and pass vars via t(key, { count: 3 }).
export type DictValue = string | string[];
export type Dict = Record<string, DictValue>;

export type TVars = Record<string, string | number>;

export interface TFn {
  (key: string, vars?: TVars): string;
  raw: (key: string) => DictValue | undefined;
}

function interpolate(template: string, vars?: TVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    const v = vars[name];
    return v === undefined ? `{${name}}` : String(v);
  });
}

export function makeT(dict: Dict, fallbackDict: Dict): TFn {
  const get = (key: string): DictValue | undefined => {
    if (key in dict) return dict[key];
    if (key in fallbackDict) return fallbackDict[key];
    return undefined;
  };
  const tFn = (key: string, vars?: TVars): string => {
    const v = get(key);
    if (typeof v === "string") return interpolate(v, vars);
    if (v === undefined && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] missing key: ${key}`);
    }
    return key;
  };
  const t = tFn as TFn;
  t.raw = get;
  return t;
}

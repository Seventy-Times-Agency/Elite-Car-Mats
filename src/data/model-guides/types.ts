/** Shapes for data/model-guides — see index.ts for the rules. */

export interface ModelGeneration {
  /** Model years as shown, e.g. "2019–2025". */
  years: string;
  /** Common generation name/code, e.g. "5th gen (XA50)". */
  name?: string;
  /** One sentence on what matters for the cabin/floor. */
  note: string;
}

export interface ModelGuide {
  /** One or two short paragraphs. */
  intro: string[];
  /** Newest first. */
  generations: ModelGeneration[];
  /** "Before you order" — what to pick or write in the trim field. */
  tips: string[];
  /** Unique meta description, ≤ 160 characters. */
  metaDescription: string;
}

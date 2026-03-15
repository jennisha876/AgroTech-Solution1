export const JAMAICA_PARISHES = [
  "Kingston",
  "St. Thomas",
  "Portland",
  "St. Mary",
  "St. Ann",
  "St. Catherine",
  "Westmoreland",
  "Hanover",
  "St. James",
  "St. Andrew",
  "Trelawny",
  "Clarendon",
  "Manchester",
  "St. Elizabeth",
] as const;

export type JamaicaParish = (typeof JAMAICA_PARISHES)[number];

export const isJamaicaParish = (value: string): value is JamaicaParish =>
  JAMAICA_PARISHES.includes(value as JamaicaParish);

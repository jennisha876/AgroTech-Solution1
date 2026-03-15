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
];

export const PARISH_COORDINATES = {
  "Kingston": { lat: 17.9712, lng: -76.7936 },
  "St. Thomas": { lat: 17.9915, lng: -76.4428 },
  "Portland": { lat: 18.1777, lng: -76.4611 },
  "St. Mary": { lat: 18.3212, lng: -76.8997 },
  "St. Ann": { lat: 18.4064, lng: -77.1047 },
  "St. Catherine": { lat: 17.9894, lng: -77.0768 },
  "Westmoreland": { lat: 18.2944, lng: -78.1564 },
  "Hanover": { lat: 18.4441, lng: -78.1336 },
  "St. James": { lat: 18.4166, lng: -77.926 },
  "St. Andrew": { lat: 18.0179, lng: -76.7608 },
  "Trelawny": { lat: 18.3526, lng: -77.6078 },
  "Clarendon": { lat: 17.9541, lng: -77.2456 },
  "Manchester": { lat: 18.042, lng: -77.5078 },
  "St. Elizabeth": { lat: 18.0512, lng: -77.6994 },
};

function normalizeParish(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^saint\b/, "st.")
    .replace(/^st\b(?!\.)/, "st.")
    .replace(/\bst\s+/g, "st. ");
}

const parishAliasToCanonical = Object.fromEntries(
  JAMAICA_PARISHES.map((parish) => [normalizeParish(parish), parish])
);

export function isValidParish(value) {
  if (!value) return true;
  return Boolean(parishAliasToCanonical[normalizeParish(value)]);
}

export function resolveParish(value) {
  const canonical = parishAliasToCanonical[normalizeParish(value)];
  if (!canonical) {
    return null;
  }

  return {
    name: canonical,
    ...PARISH_COORDINATES[canonical],
  };
}

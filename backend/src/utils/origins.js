const LOCALHOST_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const DEFAULT_FRONTEND_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

export function getAllowedFrontendOrigins() {
  const configuredOrigins = (process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_FRONTEND_ORIGINS;
}

export function isAllowedFrontendOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (LOCALHOST_ORIGIN_PATTERN.test(origin)) {
    return true;
  }

  return getAllowedFrontendOrigins().includes(origin);
}

export function getPrimaryFrontendOrigin() {
  return getAllowedFrontendOrigins()[0];
}
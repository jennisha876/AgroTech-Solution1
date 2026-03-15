const LOCALHOST_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const RENDER_ORIGIN_PATTERN = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i;

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

  // In local/dev environments, allow frontend tooling from any origin.
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (LOCALHOST_ORIGIN_PATTERN.test(origin)) {
    return true;
  }

  if (RENDER_ORIGIN_PATTERN.test(origin)) {
    return true;
  }

  return getAllowedFrontendOrigins().includes(origin);
}

export function getPrimaryFrontendOrigin() {
  return getAllowedFrontendOrigins()[0];
}
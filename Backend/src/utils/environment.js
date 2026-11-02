const requiredVariables = [
  "MONGO_URI",
  "ACCESS_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRES_IN",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRES_IN",
  "SERVER_URL",
];

export const getAllowedOrigins = (value = process.env.CORS_ORIGIN) => {
  const origins = (value || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length ? origins : ["http://localhost:5173"];
};

export const validateEnvironment = (env = process.env) => {
  const missing = requiredVariables.filter((name) => !env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const serverUrl = new URL(env.SERVER_URL);
  if (
    !["http:", "https:"].includes(serverUrl.protocol) ||
    serverUrl.pathname !== "/" ||
    serverUrl.search ||
    serverUrl.hash ||
    serverUrl.username ||
    serverUrl.password
  ) {
    throw new Error("SERVER_URL must be an http/https origin without a path or credentials");
  }

  const origins = getAllowedOrigins(env.CORS_ORIGIN);
  if (origins.includes("*")) {
    throw new Error("CORS_ORIGIN must list explicit origins when credentials are enabled");
  }

  const sameSite = (env.COOKIE_SAME_SITE || "lax").trim().toLowerCase();
  if (!["strict", "lax", "none"].includes(sameSite)) {
    throw new Error("COOKIE_SAME_SITE must be one of: strict, lax, none");
  }

  if (env.PORT !== undefined) {
    const port = Number(env.PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("PORT must be an integer between 1 and 65535");
    }
  }
};

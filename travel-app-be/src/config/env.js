const { z } = require("zod");

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const envSchema = z
  .object({
    NODE_ENV: z.string().optional(),
    REQUEST_SIGNING_SECRET: z
      .string()
      .min(16, "REQUEST_SIGNING_SECRET must be at least 16 characters"),
    CORS_ALLOWED_ORIGINS: z.string().optional(),
    FB_ADMIN_CREDENTIALS: z.string().optional(),
    FIREBASE_ADMIN_CREDENTIALS: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_MODEL: z.string().optional(),
    OPENROUTER_MODEL_CHAIN: z.string().optional(),
    GOOGLE_PLACES_API_KEY: z.string().optional(),
    RATE_LIMIT_WINDOW_MS: z
      .preprocess(toNumber, z.number().int().positive().optional()),
    RATE_LIMIT_MAX: z
      .preprocess(toNumber, z.number().int().positive().optional()),
    REQUEST_BODY_LIMIT: z.string().optional(),
    MAX_TRANSLATION_CHARS: z
      .preprocess(toNumber, z.number().int().positive().optional()),
  })
  .refine(
    (value) =>
      Boolean(value.FB_ADMIN_CREDENTIALS || value.FIREBASE_ADMIN_CREDENTIALS),
    {
      message: "FB_ADMIN_CREDENTIALS (or FIREBASE_ADMIN_CREDENTIALS) is required",
      path: ["FB_ADMIN_CREDENTIALS"],
    }
  );

const parsed = envSchema.parse(process.env);

const normalizeList = (raw = "") =>
  String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const env = {
  ...parsed,
  CORS_ALLOWED_ORIGIN_LIST: normalizeList(parsed.CORS_ALLOWED_ORIGINS),
  OPENROUTER_MODEL_CHAIN_LIST: normalizeList(parsed.OPENROUTER_MODEL_CHAIN),
};

module.exports = env;

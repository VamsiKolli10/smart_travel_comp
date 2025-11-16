const { z } = require("zod");
const { LANGUAGE_CODE_PATTERN, DEFAULT_TEXT_MAX } = require("./validation");

const langCodeSchema = z
  .string({
    required_error: "Language is required",
  })
  .regex(LANGUAGE_CODE_PATTERN, {
    message: "Language must match pattern xx or xx-XX",
  });

const limitedString = (label, max = 120) =>
  z
    .string({
      required_error: `${label} is required`,
    })
    .trim()
    .min(1, `${label} cannot be empty`)
    .max(max, `${label} must be <= ${max} characters`);

const translationSchema = z.object({
  text: z
    .string({
      required_error: "text is required",
    })
    .trim()
    .min(1, "text cannot be empty")
    .max(DEFAULT_TEXT_MAX, `text must be <= ${DEFAULT_TEXT_MAX} characters`),
  langPair: z
    .string({
      required_error: "langPair is required",
    })
    .regex(/^[a-z]{2}-[a-z]{2}$/i, "langPair must be in format source-target"),
});

const phrasebookSchema = z
  .object({
    topic: limitedString("topic", 160),
    sourceLang: langCodeSchema,
    targetLang: langCodeSchema,
    count: z.number().int().min(1).max(25).optional(),
  })
  .refine(
    (data) => data.sourceLang.toLowerCase() !== data.targetLang.toLowerCase(),
    {
      path: ["targetLang"],
      message: "sourceLang and targetLang must differ",
    }
  );

const itineraryQuerySchema = z
  .object({
    placeId: z
      .string()
      .trim()
      .max(200, "placeId must be <= 200 characters")
      .optional(),
    dest: z.string().trim().max(200).optional(),
    lat: z
      .preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z
          .number()
          .gte(-90, "lat must be >= -90")
          .lte(90, "lat must be <= 90")
      )
      .optional(),
    lng: z
      .preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z
          .number()
          .gte(-180, "lng must be >= -180")
          .lte(180, "lng must be <= 180")
      )
      .optional(),
    distance: z
      .preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().positive().max(500, "distance must be <= 500km")
      )
      .optional(),
    rating: z
      .preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().min(0).max(5)
      )
      .optional(),
    adults: z
      .preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().min(1).max(12)
      )
      .optional(),
    lang: langCodeSchema.optional(),
    page: z
      .preprocess(
        (value) => (value === undefined ? 1 : Number(value)),
        z.number().int().min(1).max(200)
      )
      .optional(),
    budget: limitedString("budget", 32).optional(),
    pace: limitedString("pace", 32).optional(),
    season: limitedString("season", 32).optional(),
    interests: limitedString("interests", 256).optional(),
    checkInDate: limitedString("checkInDate", 40).optional(),
    checkOutDate: limitedString("checkOutDate", 40).optional(),
    amenities: limitedString("amenities", 200).optional(),
    type: limitedString("type", 200).optional(),
  })
  .refine(
    (value) =>
      Boolean(value.placeId) ||
      Boolean(value.dest) ||
      (typeof value.lat === "number" && typeof value.lng === "number"),
    {
      message: "Provide placeId, dest, or lat/lng",
      path: ["placeId"],
    }
  );

const userWriteSchema = z
  .object({
    uid: limitedString("uid", 128).optional(),
    email: z.string().email(),
    name: limitedString("name", 120).optional(),
    roles: z.array(z.enum(["user", "admin"])).max(5).optional(),
    settings: z
      .object({
        language: langCodeSchema.optional(),
        notifications: z.boolean().optional(),
        theme: limitedString("theme", 40).optional(),
      })
      .optional(),
  })
  .strict();

module.exports = {
  translationSchema,
  phrasebookSchema,
  itineraryQuerySchema,
  userWriteSchema,
};

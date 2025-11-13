const { chatComplete } = require("../lib/openrouterClient");
const {
  createErrorResponse,
  ERROR_CODES,
  logError,
} = require("../utils/errorHandler");
const { fetchById: fetchPlaceById, geocodeCity } = require("../stays/providers/googlePlaces");

function sanitizeStr(v, d = "") {
  return typeof v === "string" ? v.trim() : d;
}

function toInt(v, d = 1) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
}

function sampleItinerary({ destination, days, budget, pace, season, interests }) {
  const blocksPerDay = pace === "packed" ? 5 : pace === "relaxed" ? 3 : 4;
  const interestsList = interests
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const mkBlock = (idx) => ({
    title: `Activity ${idx + 1}`,
    description: `Suggested activity aligned with ${
      interestsList[ idx % Math.max(1, interestsList.length) ] || "sightseeing"
    }`,
    area: "Central",
    time: ["Morning", "Midday", "Afternoon", "Evening", "Night"][idx % 5],
    cost: budget,
    tags: interestsList.slice(0, 3),
    poiIds: [],
  });

  const daysArr = Array.from({ length: days }).map((_, d) => ({
    day: d + 1,
    blocks: Array.from({ length: blocksPerDay }).map((__, i) => mkBlock(i)),
  }));

  return {
    destination,
    params: { days, budget, pace, season, interests },
    days: daysArr,
    tips: [
      "Group nearby activities to reduce transit time",
      "Book popular attractions in advance",
      "Plan meals near POIs to save time",
    ],
  };
}

async function generateItinerary(req, res) {
  try {
    const placeId = sanitizeStr(req.query.placeId);
    const dest = sanitizeStr(req.query.dest);
    const latQ = req.query.lat != null ? Number(req.query.lat) : undefined;
    const lngQ = req.query.lng != null ? Number(req.query.lng) : undefined;
    const days = toInt(req.query.days || 3, 3);
    const budget = sanitizeStr(req.query.budget || "mid"); // low | mid | high
    const pace = sanitizeStr(req.query.pace || "balanced"); // relaxed | balanced | packed
    const season = sanitizeStr(req.query.season || "any");
    const interests = sanitizeStr(req.query.interests || "food, culture, landmarks");
    const lang = sanitizeStr(req.query.lang || "en");

    if (!placeId && !dest && !(Number.isFinite(latQ) && Number.isFinite(lngQ))) {
      return res
        .status(400)
        .json(
          createErrorResponse(400, ERROR_CODES.BAD_REQUEST, "Provide placeId or dest or lat/lng")
        );
    }

    // Fetch destination core info to ground output
    let destination;
    if (placeId) {
      let place = null;
      try {
        place = await fetchPlaceById(placeId, lang);
      } catch (_e) {}
      destination = place
        ? { id: place.id, name: place.name, location: place.location || null }
        : { id: placeId, name: "Destination", location: null };
    } else if (dest) {
      try {
        const ge = await geocodeCity(dest, lang);
        destination = {
          id: `text:${dest}`,
          name: ge.display || dest,
          location: { lat: ge.lat, lng: ge.lng },
        };
      } catch (_e) {
        destination = { id: `text:${dest}`, name: dest, location: null };
      }
    } else {
      destination = {
        id: `coords:${latQ},${lngQ}`,
        name: "Selected area",
        location: { lat: latQ, lng: lngQ },
      };
    }

    const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);

    if (!hasOpenRouter) {
      // Fallback local sample for environments without AI key
      const payload = sampleItinerary({ destination, days, budget, pace, season, interests });
      return res.json(payload);
    }

    const system = [
      "You are a precise, friendly travel planner.",
      "Return STRICT JSON only, no extra text.",
      "Use only provided context; if something is unknown, keep it generic.",
      "Keep activities practical and geographically coherent.",
    ].join(" ");

    const user = JSON.stringify({
      instruction: "Create a structured itinerary for a traveler.",
      destination,
      params: { days, budget, pace, season, interests },
      outputSchema: {
        type: "object",
        properties: {
          destination: {
            type: "object",
            properties: { id: { type: "string" }, name: { type: "string" } },
            required: ["id", "name"],
          },
          params: {
            type: "object",
            properties: {
              days: { type: "number" },
              budget: { type: "string" },
              pace: { type: "string" },
              season: { type: "string" },
              interests: { type: "string" },
            },
            required: ["days", "budget", "pace"],
          },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "number" },
                blocks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      area: { type: "string" },
                      time: { type: "string" },
                      cost: { type: "string" },
                      tags: { type: "array", items: { type: "string" } },
                      poiIds: { type: "array", items: { type: "string" } },
                    },
                    required: ["title", "description", "time"],
                  },
                },
              },
              required: ["day", "blocks"],
            },
          },
          tips: { type: "array", items: { type: "string" } },
        },
        required: ["destination", "params", "days"],
      },
    });

    const raw = await chatComplete({
      system,
      user,
      temperature: 0.4,
      response_format: "json_object",
    });

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}$/);
      payload = match ? JSON.parse(match[0]) : null;
    }

    if (!payload || !Array.isArray(payload.days)) {
      // Soft-fallback to sample on unexpected format
      const sample = sampleItinerary({ destination, days, budget, pace, season, interests });
      return res.json(sample);
    }

    return res.json(payload);
  } catch (e) {
    logError(e, { endpoint: "/api/itinerary/generate", query: req.query });
    return res
      .status(500)
      .json(
        createErrorResponse(
          500,
          ERROR_CODES.EXTERNAL_SERVICE_ERROR,
          e.message || "Failed to generate itinerary"
        )
      );
  }
}

module.exports = { generateItinerary };

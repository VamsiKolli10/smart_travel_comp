const express = require("express");
const axios = require("axios");
const router = express.Router();
const { requireAuth } = require("../middleware/authenticate");
const {
  geocodeCity,
  nearbyLodging,
  toResultItem,
  fetchById,
  ensureKey,
  GOOGLE_API_KEY,
  PLACES_BASE_URL,
} = require("../stays/providers/googlePlaces");

router.use(requireAuth({ allowRoles: ["user", "admin"] }));

router.get("/search", async (req, res) => {
  try {
    const {
      dest,
      lat,
      lng,
      rating,
      distance,
      type,
      amenities,
      page = 1,
      lang = "en",
    } = req.query;

    let center;
    if (lat && lng) {
      center = { lat: Number(lat), lng: Number(lng) };
    } else if (dest) {
      const ge = await geocodeCity(dest, lang);
      center = { lat: ge.lat, lng: ge.lng };
    } else {
      return res.status(400).json({ error: "Provide either lat/lng or dest" });
    }

    const radius = Math.round((Number(distance) || 5) * 1000); // km -> meters
    const raw = await nearbyLodging({
      lat: center.lat,
      lng: center.lng,
      radiusMeters: radius,
      language: lang,
    });
    let items = raw.map((e) => toResultItem(e, center, lang));

    // basic filters (OSM rarely has ratings; kept for future enrichment)
    if (type) {
      const wanted = String(type)
        .split(",")
        .map((s) => s.trim());
      items = items.filter((i) => wanted.includes(i.type));
    }
    if (distance) {
      items = items.filter(
        (i) => (i.location.distanceKm ?? 9999) <= Number(distance)
      );
    }

    // amenities filter (require ALL selected amenities to be present)
    if (amenities) {
      const wantAm = String(amenities)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (wantAm.length) {
        items = items.filter((i) => {
          const has = new Set(i.amenities || []);
          return wantAm.every((a) => has.has(a));
        });
      }
    }

    if (rating) {
      const minRating = Number(rating);
      if (!Number.isNaN(minRating)) {
        items = items.filter(
          (i) => (typeof i.rating === "number" ? i.rating : 0) >= minRating
        );
      }
    }

    // simple pagination
    const pageSize = 20;
    const start = (Number(page) - 1) * pageSize;
    const slice = items.slice(start, start + pageSize);

    res.json({
      items: slice,
      page: Number(page),
      pageSize,
      total: items.length,
    });
  } catch (e) {
    console.error("Search error:", {
      message: e.message,
      stack: e.stack,
      response: e.response?.data,
    });
    const status = e.response?.status || e.status || 500;
    const message =
      e.response?.data?.error?.message || e.message || "Failed to search stays";
    res.status(status).json({ error: message });
  }
});

const encodePlaceName = (name) =>
  String(name).split("/").map(encodeURIComponent).join("/");

// GET /api/stays/photo?name=<places/.../photos/...>&maxWidth=800
router.get("/photo", async (req, res) => {
  const { name, ref, maxWidth, maxHeight } = req.query;

  try {
    ensureKey();

    if (name) {
      const params = {};
      if (maxWidth) params.maxWidthPx = Number(maxWidth);
      if (maxHeight) params.maxHeightPx = Number(maxHeight);
      if (!params.maxWidthPx && !params.maxHeightPx) {
        params.maxWidthPx = 800;
      }

      const response = await axios.get(
        `${PLACES_BASE_URL}/${encodePlaceName(name)}/media`,
        {
          headers: {
            "X-Goog-Api-Key": GOOGLE_API_KEY,
            Accept: "image/*",
          },
          params,
          responseType: "stream",
          validateStatus: (status) => status === 200,
        }
      );

      if (response.headers["content-type"]) {
        res.setHeader("Content-Type", response.headers["content-type"]);
      }
      res.setHeader(
        "Cache-Control",
        "public, max-age=86400, stale-while-revalidate=86400"
      );

      return response.data.pipe(res);
    }

    if (ref) {
      const params = {
        key: GOOGLE_API_KEY,
        photoreference: ref,
      };
      if (maxWidth) params.maxwidth = maxWidth;
      if (maxHeight) params.maxheight = maxHeight;
      if (!params.maxwidth && !params.maxheight) {
        params.maxwidth = 800;
      }

      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/photo",
        {
          params,
          responseType: "stream",
          validateStatus: (status) => status === 200,
        }
      );

      if (response.headers["content-type"]) {
        res.setHeader("Content-Type", response.headers["content-type"]);
      }
      res.setHeader(
        "Cache-Control",
        "public, max-age=86400, stale-while-revalidate=86400"
      );

      return response.data.pipe(res);
    }

    return res
      .status(400)
      .json({ error: "Photo name or reference is required" });
  } catch (e) {
    console.error("Failed to fetch photo", e.message || e);
    res.status(500).json({ error: "Failed to fetch photo" });
  }
});

// GET /api/stays/:id
router.get("/:id", async (req, res) => {
  try {
    const stay = await fetchById(req.params.id, req.query.lang || "en");
    if (!stay) return res.status(404).json({ error: "Not found" });
    res.json(stay);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

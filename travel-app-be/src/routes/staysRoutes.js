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
const {
  expressErrorHandler,
  createErrorResponse,
  ERROR_CODES,
  logError,
} = require("../utils/errorHandler");

const encodePlacePath = (name) =>
  String(name)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

// Photo endpoint is public - no authentication required
router.get("/photo", async (req, res) => {
  const { name, ref, maxWidth, maxHeight } = req.query;

  try {
    ensureKey();

    const photoName = name || ref;
    if (!photoName) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            ERROR_CODES.BAD_REQUEST,
            "Place photo name is required"
          )
        );
    }

    const params = {};
    if (maxWidth) params.maxWidthPx = Number(maxWidth);
    if (maxHeight) params.maxHeightPx = Number(maxHeight);
    if (!params.maxWidthPx && !params.maxHeightPx) {
      params.maxWidthPx = 640;
    }

    const endpoint = `${PLACES_BASE_URL}/${encodePlacePath(photoName)}/media`;
    const response = await axios.get(endpoint, {
      headers: {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "*",
        Accept: "image/*",
      },
      params,
      responseType: "stream",
      maxRedirects: 0,
      validateStatus: (status) => status === 200 || status === 302,
    });

    // Set permissive headers to avoid CORP blocking when FE and BE differ (5173 vs 8000)
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Let the browser follow Google's redirect directly (more robust than re-streaming)
    if (response.status === 302 && response.headers.location) {
      res.setHeader(
        "Cache-Control",
        "public, max-age=86400, stale-while-revalidate=86400"
      );
      return res.redirect(302, response.headers.location);
    }

    if (response.headers["content-type"]) {
      res.setHeader("Content-Type", response.headers["content-type"]);
    }
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=86400"
    );

    return response.data.pipe(res);
  } catch (e) {
    logError(e, { endpoint: "/api/stays/photo", query: req.query });
    return res
      .status(502)
      .json(
        createErrorResponse(
          502,
          ERROR_CODES.EXTERNAL_SERVICE_ERROR,
          "Failed to fetch photo from provider"
        )
      );
  }
});

// Public search endpoint - no authentication required
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
      checkInDate,
      checkOutDate,
      adults,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);

    let center;
    let resolvedDestination = null;
    if (lat && lng) {
      center = { lat: Number(lat), lng: Number(lng) };
    } else if (dest) {
      const ge = await geocodeCity(dest, lang);
      center = { lat: ge.lat, lng: ge.lng };
      resolvedDestination = {
        query: dest,
        display: ge.display,
        address: ge.address,
        city: ge.city,
        state: ge.state,
        country: ge.country,
        lat: ge.lat,
        lng: ge.lng,
      };
    } else {
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            ERROR_CODES.BAD_REQUEST,
            "Provide either lat/lng or dest"
          )
        );
    }

    const radius = Math.round((Number(distance) || 5) * 1000); // km -> meters
    const raw = await nearbyLodging({
      lat: center.lat,
      lng: center.lng,
      radiusMeters: radius,
      language: lang,
    });
    let items = raw.map((e) => toResultItem(e, center, lang));

    // basic filters
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
    const pageSize = 5;
    const totalResults = items.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    const currentPage = Math.min(pageNumber, totalPages);
    const start = (currentPage - 1) * pageSize;
    const slice = items.slice(start, start + pageSize);

    res.json({
      items: slice,
      page: currentPage,
      pageSize,
      total: totalResults,
      totalPages,
      resolvedDestination,
    });
  } catch (e) {
    logError(e, { endpoint: "/api/stays/search", query: req.query });
    const status = e.response?.status || e.status || 500;
    const message =
      e.response?.data?.error?.message || e.message || "Failed to search stays";
    res
      .status(status)
      .json(
        createErrorResponse(status, ERROR_CODES.EXTERNAL_SERVICE_ERROR, message)
      );
  }
});

// Public endpoint - no authentication required
router.get("/:id", async (req, res) => {
  try {
    const stay = await fetchById(req.params.id, req.query.lang || "en");
    if (!stay)
      return res
        .status(404)
        .json(
          createErrorResponse(404, ERROR_CODES.NOT_FOUND, "Stay not found")
        );
    res.json(stay);
  } catch (e) {
    logError(e, { endpoint: "/api/stays/:id", id: req.params.id });
    res
      .status(500)
      .json(createErrorResponse(500, ERROR_CODES.DB_ERROR, e.message));
  }
});

module.exports = router;

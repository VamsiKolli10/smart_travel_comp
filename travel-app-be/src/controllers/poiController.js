const axios = require("axios");
const {
  searchNearbyPoi,
  mapPlaceToPoiCard,
  applySmartFilters,
} = require("../poi/providers/googlePlacesPoi");
const {
  fetchById: fetchPlaceById,
  geocodeCity,
} = require("../stays/providers/googlePlaces");
const {
  createErrorResponse,
  ERROR_CODES,
  logError,
} = require("../utils/errorHandler");

async function wikiSummary(title, lang = "en") {
  try {
    const endpoint = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`;
    const { data } = await axios.get(endpoint, { timeout: 4000 });
    if (data?.extract) return data.extract;
  } catch (_e) {}
  return null;
}

async function search(req, res) {
  try {
    const {
      dest,
      lat,
      lng,
      distance,
      category,
      kidFriendly,
      accessibility,
      openNow,
      timeNeeded,
      cost,
      lang = "en",
      page = 1,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);

    let center;
    let resolvedDestination = null;
    if (lat && lng) {
      center = { lat: Number(lat), lng: Number(lng) };
    } else if (dest) {
      // Use existing, well-tested geocoder shared with Stays
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

    const radius = Math.round((Number(distance) || 5) * 1000);
    const raw = await searchNearbyPoi({
      lat: center.lat,
      lng: center.lng,
      radiusMeters: radius,
      language: lang,
      categories: category,
    });

    // Map and enrich
    let items = raw.map((p) => mapPlaceToPoiCard(p, center, lang));
    items = applySmartFilters(items, {
      kidFriendly,
      accessibility,
      openNow,
      timeNeeded,
      cost,
      categoriesWanted: category,
    });

    // Pagination
    const pageSize = 20;
    const totalResults = items.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    const currentPage = Math.min(pageNumber, totalPages);
    const start = (currentPage - 1) * pageSize;
    const slice = items.slice(start, start + pageSize);

    return res.json({
      items: slice,
      total: totalResults,
      page: currentPage,
      pageSize,
      totalPages,
      resolvedDestination,
    });
  } catch (e) {
    logError(e, { endpoint: "/api/poi/search", query: req.query });
    const status = e.response?.status || e.status || 500;
    const message =
      e.response?.data?.error?.message || e.message || "Failed to search POIs";
    return res
      .status(status)
      .json(
        createErrorResponse(status, ERROR_CODES.EXTERNAL_SERVICE_ERROR, message)
      );
  }
}

async function details(req, res) {
  const { id } = req.params;
  const lang = req.query.lang || "en";
  try {
    const place = await fetchPlaceById(id, lang);
    if (!place) {
      return res
        .status(404)
        .json(
          createErrorResponse(404, ERROR_CODES.NOT_FOUND, "Destination not found")
        );
    }

    // Try to enrich description with Wikipedia summary when missing
    let description = place.description || "";
    if (!description && place.name) {
      description = (await wikiSummary(place.name, lang)) || "";
    }

    const payload = {
      ...place,
      description,
    };
    return res.json(payload);
  } catch (e) {
    logError(e, { endpoint: "/api/poi/:id", id });
    const status = e.response?.status || e.status || 500;
    return res
      .status(status)
      .json(
        createErrorResponse(status, ERROR_CODES.EXTERNAL_SERVICE_ERROR, e.message)
      );
  }
}

module.exports = { search, details };

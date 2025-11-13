const axios = require("axios");

const PLACES = "https://maps.googleapis.com/maps/api/place";
const GEOCODE = "https://maps.googleapis.com/maps/api/geocode/json";
const KEY = process.env.GOOGLE_PLACES_API_KEY;

// -------- helpers --------
function toRad(d) { return (d * Math.PI) / 180; }
function haversine(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(100 * (2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)))) / 100;
}
function photoUrl(photoRef, maxWidth = 640) {
  if (!photoRef) return null;
  return `${PLACES}/photo?maxwidth=${maxWidth}&photo_reference=${encodeURIComponent(photoRef)}&key=${KEY}`;
}

// -------- geocoding (throws with status on failure) --------
async function geocodeCity(city, language = "en") {
  try {
    const ts = await axios.get(`${PLACES}/textsearch/json`, {
      params: { query: city, key: KEY, language },
    });
    if (ts.data?.status === "OK" && ts.data.results?.length) {
      const p = ts.data.results[0];
      return {
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
        display: p.formatted_address || p.name,
      };
    }
    const msg = ts.data?.error_message || "No results";
    throw new Error(`PLACES_TEXTSEARCH_${ts.data?.status || "UNKNOWN"}: ${msg}`);
  } catch (e) {
    // Fallback: Geocoding API
    try {
      const gc = await axios.get(GEOCODE, {
        params: { address: city, key: KEY, language },
      });
      if (gc.data?.status === "OK" && gc.data.results?.length) {
        const p = gc.data.results[0];
        return {
          lat: p.geometry.location.lat,
          lng: p.geometry.location.lng,
          display: p.formatted_address || city,
        };
      }
      const msg = gc.data?.error_message || "No results";
      throw new Error(`GEOCODE_${gc.data?.status || "UNKNOWN"}: ${msg}`);
    } catch (e2) {
      // propagate the most useful error
      throw new Error(e2?.message || e?.message || "Unable to geocode city");
    }
  }
}

// -------- search (Nearby → TextSearch; throws with status if both fail) --------
async function nearbyLodging({ lat, lng, radiusMeters = 10000, language = "en", q }) {
  const radius = Math.max(500, Math.min(50000, Math.round(radiusMeters)));

  // 1) Nearby Search for type=lodging
  try {
    const near = await axios.get(`${PLACES}/nearbysearch/json`, {
      params: {
        key: KEY,
        location: `${lat},${lng}`,
        radius,
        type: "lodging",
        language,
      },
    });
    if (near.data?.status === "OK" && Array.isArray(near.data.results) && near.data.results.length) {
      return near.data.results;
    }
    // If ZERO_RESULTS, try Text Search; for other statuses, throw
    if (near.data?.status && near.data.status !== "ZERO_RESULTS") {
      const msg = near.data?.error_message || "Request failed";
      throw new Error(`NEARBY_${near.data.status}: ${msg}`);
    }
  } catch (_e) {
    // fall through to Text Search
  }

  // 2) Fallback: Text Search (bias to location)
  const query = q ? `hotels in ${q}` : "hotels";
  const ts = await axios.get(`${PLACES}/textsearch/json`, {
    params: {
      key: KEY,
      query,
      language,
      location: `${lat},${lng}`,
      radius,
    },
  });
  if (ts.data?.status === "OK" && Array.isArray(ts.data.results)) {
    return ts.data.results;
  }
  const msg = ts.data?.error_message || "No results";
  throw new Error(`TEXTSEARCH_${ts.data?.status || "UNKNOWN"}: ${msg}`);
}

// -------- mapping helpers --------
function toResultItem(place, center) {
  const loc = place.geometry?.location || {};
  const lat = loc.lat, lng = loc.lng;
  const distanceKm = (center && typeof lat === "number" && typeof lng === "number")
    ? haversine(center, { lat, lng })
    : null;

  const price = place.price_level != null ? { priceLevel: place.price_level } : null;
  const rating = place.rating != null ? place.rating : null;
  const reviewsCount = place.user_ratings_total ?? null;
  const thumbRef = place.photos?.[0]?.photo_reference;
  const thumbnail = thumbRef ? photoUrl(thumbRef, 640) : null;
  const type = place.types?.includes("lodging") ? "hotel" : "lodging";

  return {
    id: place.place_id,
    name: place.name,
    price,
    rating,
    reviewsCount,
    type,
    amenities: [],
    location: { lat, lng, distanceKm, address: place.formatted_address || place.vicinity || null },
    thumbnail,
    provider: { name: "Google", deeplink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}` },
    sourceLang: "auto",
  };
}

// -------- details --------
async function detailsById(placeId, language = "en") {
  const { data } = await axios.get(`${PLACES}/details/json`, {
    params: {
      key: KEY,
      place_id: placeId,
      language,
      fields: "place_id,name,geometry,formatted_address,price_level,rating,user_ratings_total,types,photos,editorial_summary,website,url",
    },
  });
  const p = data?.result;
  if (!p) return null;

  const lat = p.geometry?.location?.lat;
  const lng = p.geometry?.location?.lng;
  const photos = (p.photos || []).map((ph) => photoUrl(ph.photo_reference, 1280)).filter(Boolean);

  return {
    id: p.place_id,
    name: p.name,
    description: p.editorial_summary?.overview || "",
    photos,
    price: p.price_level != null ? { priceLevel: p.price_level } : null,
    rating: p.rating ?? null,
    reviews: [],
    amenities: [],
    policies: {},
    location: { lat, lng, address: p.formatted_address || null },
    provider: { name: "Google", deeplink: p.url || `https://www.google.com/maps/place/?q=place_id:${p.place_id}` },
    sourceLang: "auto",
    type: p.types?.includes("lodging") ? "hotel" : "lodging",
    thumbnail: photos[0] || null,
    reviewsCount: p.user_ratings_total ?? null,
  };
}

module.exports = {
  geocodeCity,
  nearbyLodging,
  toResultItem,
  detailsById,
};

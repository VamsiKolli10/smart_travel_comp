const axios = require("axios");

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const OVERPASS = "https://overpass-api.de/api/interpreter";

function deg2rad(d) { return d * (Math.PI / 180); }
function kmBetween(a, b) {
  const R = 6371;
  const dLat = deg2rad(b.lat - a.lat), dLng = deg2rad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2) ** 2 +
             Math.cos(deg2rad(a.lat)) * Math.cos(deg2rad(b.lat)) *
             Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
}

async function geocodeCity(city, language = "en") {
  const { data } = await axios.get(NOMINATIM, {
    params: {
      q: city,
      format: "json",
      addressdetails: 1,
      limit: 1,
      "accept-language": language
    },
    headers: { "User-Agent": "smart-travel-companion/1.0" }
  });
  if (!data?.[0]) throw new Error("Unable to geocode city");
  return { lat: Number(data[0].lat), lng: Number(data[0].lon), display: data[0].display_name };
}

// OSM tags for lodging categories
const TAG_EXPR = '["tourism"~"hotel|hostel|guest_house|motel|apartment"]';

async function nearbyLodging({ lat, lng, radiusMeters = 5000 }) {
  // Around search for nodes/ways/relations, return center coords
  const q = `
[out:json][timeout:25];
(
  node${TAG_EXPR}(around:${radiusMeters},${lat},${lng});
  way${TAG_EXPR}(around:${radiusMeters},${lat},${lng});
  relation${TAG_EXPR}(around:${radiusMeters},${lat},${lng});
);
out center 200;
`;
  const { data } = await axios.post(OVERPASS, q, {
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
      "User-Agent": "smart-travel-companion/1.0"
    }
  });
  return data?.elements || [];
}

function normalizeType(tags = {}) {
  const t = tags.tourism;
  if (!t) return "lodging";
  if (t === "guest_house") return "guesthouse";
  return t; // hotel | hostel | motel | apartment
}

function inferAmenities(tags = {}) {
  const am = [];
  if (tags.internet_access === "wlan" || tags["internet_access:ssid"]) am.push("wifi");
  if (tags.parking || tags.parking === "yes") am.push("parking");
  if (tags.air_conditioning === "yes") am.push("ac");
  if (tags.kitchen || tags.room === "kitchen") am.push("kitchen");
  if (tags.swimming_pool === "yes" || tags.pool === "yes") am.push("pool");
  return am;
}

function toResultItem(el, center) {
  const id = `${el.type}_${el.id}`;
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  const distanceKm = (center && lat && lng)
    ? Number(kmBetween(center, { lat, lng }).toFixed(2))
    : null;
  const tags = el.tags || {};
  const name = tags.name || "Unnamed lodging";
  const type = normalizeType(tags);
  const amenities = inferAmenities(tags);

  return {
    id,
    name,
    price: null,                // OSM has no prices
    rating: null,               // OSM has no ratings
    reviewsCount: null,
    type,
    amenities,
    location: { lat, lng, distanceKm, address: tags["addr:full"] || undefined },
    thumbnail: null,            // OSM has no photos; you can add a stock image or later map to provider photos
    provider: { name: "OpenStreetMap", deeplink: null },
    sourceLang: "auto"
  };
}

/**
 * Fetch a single OSM element by id and return normalized details.
 * id format: "node_123" | "way_456" | "relation_789"
 */
async function fetchById(id) {
  const [type, rawId] = String(id).split("_");
  if (!type || !rawId) throw new Error("Invalid OSM id");

  const q = `
[out:json][timeout:25];
${type}(${rawId});
out center tags;
`;
  const { data } = await axios.post(OVERPASS, q, {
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
      "User-Agent": "smart-travel-companion/1.0"
    }
  });

  const el = data?.elements?.[0];
  if (!el) return null;

  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  const tags = el.tags || {};

  return {
    id: `${type}_${rawId}`,
    name: tags.name || "Unnamed lodging",
    description: tags.description || "",
    photos: [], // OSM has none
    price: null,
    rating: null,
    reviews: [],
    amenities: inferAmenities(tags),
    policies: {},
    location: {
      lat,
      lng,
      address:
        tags["addr:full"] ||
        [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]]
          .filter(Boolean)
          .join(", ") ||
        null,
    },
    provider: { name: "OpenStreetMap", deeplink: null },
    sourceLang: "auto",
    rawTags: tags, // helpful for debugging/enrichment
    type: normalizeType(tags),
  };
}

module.exports = {
  geocodeCity,
  nearbyLodging,
  toResultItem,
  fetchById, // <-- exported
};

const axios = require("axios");

const GOOGLE_HOTELS_API_KEY = process.env.GOOGLE_HOTELS_API_KEY;
const HOTELS_BASE_URL = "https://travel.googleapis.com/v1";
const PHOTO_PROXY_PATH = "/api/stays/photo";

if (!GOOGLE_HOTELS_API_KEY) {
  console.warn(
    "[stays] Missing GOOGLE_HOTELS_API_KEY. Google Hotels requests will fail until it is configured."
  );
}

function ensureKey() {
  if (!GOOGLE_HOTELS_API_KEY) {
    const err = new Error(
      "Google Hotels API key not configured (GOOGLE_HOTELS_API_KEY)"
    );
    err.status = 500;
    throw err;
  }
}

function hotelsHeaders() {
  ensureKey();
  return {
    "X-Goog-Api-Key": GOOGLE_HOTELS_API_KEY,
    "Content-Type": "application/json",
  };
}

const TYPE_ALIASES = {
  hotel: ["hotel"],
  hostel: ["hostel"],
  guesthouse: ["guest_house", "guesthouse", "bed_and_breakfast"],
  motel: ["motel"],
  apartment: ["apartment", "serviced_apartment"],
  resort: ["resort"],
};

const GENERIC_LODGING_TYPES = new Set(["lodging"]);

const AMENITY_TYPE_MAP = {
  spa: "spa",
  gym: "fitness_center",
  parking: "parking",
  bar: "bar",
  restaurant: "restaurant",
  swimming_pool: "pool",
  laundry: "laundry_service",
  airport_shuttle: "airport_shuttle",
  breakfast: "breakfast",
  store: "mini_market",
  pet_friendly: "pet_friendly",
  wheelchair_accessible_entrance: "wheelchair_accessible_entrance",
};

const PRICE_LABEL_MAP = {
  FREE: "Free",
  INEXPENSIVE: "$",
  MODERATE: "$$",
  EXPENSIVE: "$$$",
  VERY_EXPENSIVE: "$$$$",
};

const KNOWN_FEATURES = new Set([
  "wifi",
  "parking",
  "pool",
  "restaurant",
  "bar",
  "fitness_center",
  "spa",
  "laundry_service",
  "airport_shuttle",
  "breakfast",
  "mini_market",
  "pet_friendly",
  "wheelchair_accessible_entrance",
  "wheelchair_accessible_parking",
  "contactless_payment",
  "operational",
  "temporarily_closed",
  "closed_permanently",
  "open_now",
  "open_24h",
]);

function deg2rad(d) {
  return d * (Math.PI / 180);
}
function kmBetween(a, b) {
  const R = 6371;
  const dLat = deg2rad(b.lat - a.lat);
  const dLng = deg2rad(b.lng - a.lng);
  const s1 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(a.lat)) *
      Math.cos(deg2rad(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
}

function inferType(types = []) {
  if (!Array.isArray(types) || !types.length) return "lodging";
  const lower = types.map((t) => t.toLowerCase());

  for (const [key, aliases] of Object.entries(TYPE_ALIASES)) {
    if (aliases.some((alias) => lower.includes(alias))) {
      return key;
    }
  }

  if (lower.some((alias) => GENERIC_LODGING_TYPES.has(alias))) {
    return "hotel";
  }

  return "lodging";
}

function inferAmenitiesFromTypes(types = []) {
  if (!Array.isArray(types)) return [];
  const lower = types.map((t) => t.toLowerCase());
  const out = new Set();

  Object.entries(AMENITY_TYPE_MAP).forEach(([gType, label]) => {
    if (lower.includes(gType)) out.add(label);
  });

  if (lower.includes("parking") || lower.includes("car_rental")) {
    out.add("parking");
  }
  if (lower.includes("wifi") || lower.includes("internet_cafe")) {
    out.add("wifi");
  }

  return Array.from(out);
}

function collectHotelFeatures(hotel = {}) {
  const features = new Set();

  // Add amenities from the API
  if (Array.isArray(hotel.amenities)) {
    hotel.amenities.forEach((amenity) => {
      const amenityType = amenity.type?.toLowerCase();
      if (amenityType) {
        const mappedAmenity = AMENITY_TYPE_MAP[amenityType] || amenityType;
        features.add(mappedAmenity);
      }
    });
  }

  // Add status information
  const status = hotel.status?.toLowerCase();
  if (
    status === "operational" ||
    status === "temporarily_closed" ||
    status === "closed_permanently"
  ) {
    features.add(status);
  }

  // Add operating hours information
  if (hotel.open_now !== undefined) {
    features.add(hotel.open_now ? "open_now" : "closed");
  }

  // Check for 24-hour operation
  if (hotel.hours && Array.isArray(hotel.hours) && hotel.hours.length > 0) {
    if (
      hotel.hours.some(
        (hours) => hours.includes("24") || hours.includes("24-hour")
      )
    ) {
      features.add("open_24h");
    }
  }

  // Add accessibility information
  if (hotel.accessibility && Array.isArray(hotel.accessibility)) {
    if (hotel.accessibility.includes("wheelchair_accessible_entrance")) {
      features.add("wheelchair_accessible_entrance");
    }
    if (hotel.accessibility.includes("wheelchair_accessible_parking")) {
      features.add("wheelchair_accessible_parking");
    }
    if (hotel.accessibility.includes("contactless_payment")) {
      features.add("contactless_payment");
    }
  }

  const sorted = Array.from(features);
  sorted.sort((a, b) => {
    const aKnown = KNOWN_FEATURES.has(a) ? 0 : 1;
    const bKnown = KNOWN_FEATURES.has(b) ? 0 : 1;
    if (aKnown !== bKnown) return aKnown - bKnown;
    return a.localeCompare(b);
  });

  return sorted.slice(0, 6);
}

function pricePayload(priceLevel) {
  if (!priceLevel) return null;
  return {
    priceLevel: PRICE_LABEL_MAP[priceLevel] || priceLevel,
    raw: priceLevel,
  };
}

function buildPhotoProxy(photo, { maxWidth, maxHeight } = {}) {
  if (!photo) return null;
  const params = new URLSearchParams({
    photo_url: photo.url || "",
    maxWidth: String(maxWidth || 640),
  });
  if (maxHeight) {
    params.append("maxHeight", String(maxHeight));
  }
  return `${PHOTO_PROXY_PATH}?${params.toString()}`;
}

function mapHotelToResult(hotel, center, language = "en") {
  const latitude = Number(hotel.location?.latitude);
  const longitude = Number(hotel.location?.longitude);
  const distanceKm =
    center && latitude != null && longitude != null
      ? Number(kmBetween(center, { lat: latitude, lng: longitude }).toFixed(2))
      : null;

  const photos = Array.isArray(hotel.photos)
    ? hotel.photos.map((photo) => ({
        url: photo.url,
        width: photo.width,
        height: photo.height,
        alt: photo.caption || hotel.name,
      }))
    : [];

  return {
    id: hotel.hotel_id || hotel.id,
    name: hotel.name,
    rating: hotel.rating ?? null,
    reviewsCount: hotel.reviews_count ?? hotel.reviews?.length ?? null,
    price: pricePayload(hotel.price_level),
    type: inferType(hotel.types || [hotel.hotel_type]),
    amenities: collectHotelFeatures(hotel),
    location: {
      lat: latitude ?? null,
      lng: longitude ?? null,
      distanceKm,
      address: hotel.address?.formatted_address || hotel.address || hotel.name,
    },
    photos,
    thumbnail: photos[0]?.url || null,
    provider: {
      name: "Google Hotels",
      deeplink: hotel.booking_url || null,
    },
    sourceLang: language,
  };
}

function mapHotelToDetail(hotel, language = "en") {
  const latitude = Number(hotel.location?.latitude);
  const longitude = Number(hotel.location?.longitude);

  const photos = Array.isArray(hotel.photos)
    ? hotel.photos.map((photo) => ({
        url: photo.url,
        width: photo.width,
        height: photo.height,
        alt: photo.caption || hotel.name,
      }))
    : [];

  const openingHours = hotel.hours || [];

  const reviews = Array.isArray(hotel.reviews)
    ? hotel.reviews.slice(0, 5).map((review) => ({
        author_name: review.author || "Guest reviewer",
        rating: review.rating ?? null,
        text: review.text || "",
        relative_time_description: review.relative_time_description || "",
      }))
    : [];

  return {
    id: hotel.hotel_id || hotel.id,
    name: hotel.name,
    description: hotel.description || "",
    rating: hotel.rating ?? null,
    reviewsCount: hotel.reviews_count ?? hotel.reviews?.length ?? null,
    price: pricePayload(hotel.price_level),
    amenities: collectHotelFeatures(hotel),
    reviews,
    photos,
    location: {
      lat: latitude ?? null,
      lng: longitude ?? null,
      address: hotel.address?.formatted_address || hotel.address || hotel.name,
    },
    phone: hotel.phone_number || null,
    website: hotel.website || null,
    openingHours,
    provider: {
      name: "Google Hotels",
      deeplink: hotel.booking_url || null,
    },
    sourceLang: language,
    type: inferType(hotel.types || [hotel.hotel_type]),
    thumbnail: photos[0]?.url || null,
  };
}

async function searchHotelsByLocation({
  latitude,
  longitude,
  radiusKm = 5,
  language = "en",
  checkInDate,
  checkOutDate,
  adults = 2,
  minPrice,
  maxPrice,
  maxResultCount = 20,
}) {
  ensureKey();

  try {
    // Convert km to meters for API
    const radiusMeters = Math.min(radiusKm * 1000, 50000); // API max is 50km

    const requestBody = {
      language_code: language,
      search_window: {
        check_in_date: checkInDate || new Date().toISOString().split("T")[0], // Default to today
        check_out_date:
          checkOutDate ||
          new Date(Date.now() + 86400000).toISOString().split("T")[0], // Default to tomorrow
      },
      traveler_count: {
        adults_count: adults,
      },
      geo_point: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      radius_meters: radiusMeters,
      max_result_count: maxResultCount,
    };

    // Add optional filters
    if (minPrice) requestBody.price_range = { min: Number(minPrice) };
    if (maxPrice) {
      requestBody.price_range = requestBody.price_range || {};
      requestBody.price_range.max = Number(maxPrice);
    }

    const { data } = await axios.post(
      `${HOTELS_BASE_URL}/hotels:searchHotelsByLocation`,
      requestBody,
      {
        headers: hotelsHeaders(),
      }
    );

    return data?.hotels || [];
  } catch (error) {
    console.error("Search hotels error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to search hotels"
    );
  }
}

async function searchHotelsByText({
  query,
  language = "en",
  checkInDate,
  checkOutDate,
  adults = 2,
  minPrice,
  maxPrice,
  maxResultCount = 20,
}) {
  ensureKey();

  try {
    const requestBody = {
      language_code: language,
      search_window: {
        check_in_date: checkInDate || new Date().toISOString().split("T")[0], // Default to today
        check_out_date:
          checkOutDate ||
          new Date(Date.now() + 86400000).toISOString().split("T")[0], // Default to tomorrow
      },
      traveler_count: {
        adults_count: adults,
      },
      text_query: query,
      max_result_count: maxResultCount,
    };

    // Add optional filters
    if (minPrice) requestBody.price_range = { min: Number(minPrice) };
    if (maxPrice) {
      requestBody.price_range = requestBody.price_range || {};
      requestBody.price_range.max = Number(maxPrice);
    }

    const { data } = await axios.post(
      `${HOTELS_BASE_URL}/hotels:searchHotelsByText`,
      requestBody,
      {
        headers: hotelsHeaders(),
      }
    );

    return data?.hotels || [];
  } catch (error) {
    console.error("Search hotels by text error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to search hotels by text"
    );
  }
}

async function geocodeCity(city, language = "en") {
  ensureKey();
  try {
    // First search for hotels by text to get location
    const hotels = await searchHotelsByText({
      query: city,
      language,
      maxResultCount: 1,
    });

    const hotel = hotels[0];
    if (!hotel) throw new Error("Unable to geocode city");

    const lat = Number(hotel.location?.latitude);
    const lng = Number(hotel.location?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error("Unable to geocode city coordinates");
    }

    return {
      lat,
      lng,
      display: hotel.address?.formatted_address || hotel.address || city,
    };
  } catch (error) {
    console.error("Geocode error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to geocode city"
    );
  }
}

async function nearbyLodging({
  lat,
  lng,
  radiusMeters = 5000,
  language = "en",
}) {
  // Convert to km for the API call
  const radiusKm = Math.min(radiusMeters / 1000, 50); // API max is 50km

  try {
    const hotels = await searchHotelsByLocation({
      latitude: lat,
      longitude: lng,
      radiusKm,
      language,
    });

    return hotels;
  } catch (error) {
    console.error("Nearby lodging error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to search nearby lodging"
    );
  }
}

async function fetchById(hotelId, language = "en") {
  ensureKey();

  try {
    const { data } = await axios.get(
      `${HOTELS_BASE_URL}/hotels/${encodeURIComponent(hotelId)}`,
      {
        headers: hotelsHeaders(),
        params: {
          language_code: language,
        },
      }
    );

    if (!data) return null;
    return mapHotelToDetail(data, language);
  } catch (error) {
    console.error("Fetch by ID error:", {
      message: error.message,
      hotelId,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to fetch hotel details"
    );
  }
}

module.exports = {
  geocodeCity,
  nearbyLodging,
  toResultItem: mapHotelToResult,
  fetchById,
  ensureKey,
  buildPhotoProxy,
  GOOGLE_HOTELS_API_KEY,
  HOTELS_BASE_URL,
};

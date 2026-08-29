function splitCityStateCountry(address, fallbackCity = "") {
  if (!address || typeof address !== "string") {
    return {
      city: fallbackCity || "",
      state: "",
      country: "",
    };
  }

  const parts = address
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (!parts.length) {
    return {
      city: fallbackCity || "",
      state: "",
      country: "",
    };
  }

  const country = parts.pop() || "";
  let state = "";
  if (parts.length >= 2) {
    state = parts.pop() || "";
  }

  let city = parts.join(", ");
  if (!city) {
    city = parts[0] || "";
  }
  if (!city && fallbackCity) {
    city = fallbackCity;
  }

  return {
    city,
    state,
    country,
  };
}

export function normalizeDestinationInput(value, overrides = {}) {
  const rawInput = typeof value === "string" ? value.trim() : "";
  const providedDisplay =
    overrides.display ||
    overrides.displayName ||
    overrides.destination ||
    overrides.name ||
    "";
  const displayName = (providedDisplay || rawInput).trim();
  const candidates =
    overrides.address ||
    overrides.fullAddress ||
    overrides.destinationDisplayName ||
    displayName ||
    rawInput;

  const parsed = splitCityStateCountry(
    candidates,
    overrides.city || overrides.cityName || rawInput
  );

  const city =
    (overrides.city || overrides.cityName || parsed.city || "").trim();
  const state =
    (overrides.state || overrides.region || parsed.state || "").trim();
  const country =
    (
      overrides.country ||
      overrides.countryCode ||
      parsed.country ||
      ""
    ).trim();

  const normalized = {
    destination: displayName || rawInput || "",
    destinationDisplayName: displayName || rawInput || "",
    destinationCity: city,
    destinationState: state,
    destinationCountry: country,
  };

  const latCandidate =
    overrides.lat ?? overrides.latitude ?? overrides.destinationLat;
  const lngCandidate =
    overrides.lng ?? overrides.longitude ?? overrides.destinationLng;

  if (typeof latCandidate === "number" && Number.isFinite(latCandidate)) {
    normalized.destinationLat = latCandidate;
  }
  if (typeof lngCandidate === "number" && Number.isFinite(lngCandidate)) {
    normalized.destinationLng = lngCandidate;
  }

  if (!normalized.destination && (city || state || country)) {
    normalized.destination = [city, state || country]
      .filter(Boolean)
      .join(", ");
    normalized.destinationDisplayName = normalized.destination;
  }

  return normalized;
}

export function formatDestinationLabel({
  city,
  state,
  country,
  fallback,
} = {}) {
  const parts = [city, state].filter((part) => Boolean(part));
  if (!parts.length && country) {
    parts.push(country);
  }
  const label = parts.join(", ");
  return label || fallback || "";
}

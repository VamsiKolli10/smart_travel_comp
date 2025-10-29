const express = require("express");
const router = express.Router();
const { geocodeCity, nearbyLodging, toResultItem } = require("../stays/providers/osm");

// GET /api/stays/search
router.get("/search", async (req, res) => {
  try {
    const {
      dest, lat, lng, rating, distance, type, amenities,
      page = 1, lang = "en"
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
    const raw = await nearbyLodging({ lat: center.lat, lng: center.lng, radiusMeters: radius });
    let items = raw.map((e) => toResultItem(e, center));

    // basic filters on type/distance (rating not available in OSM)
    if (type) {
      const wanted = String(type).split(",").map(s => s.trim());
      items = items.filter(i => wanted.includes(i.type));
    }
    if (distance) items = items.filter(i => (i.location.distanceKm ?? 9999) <= Number(distance));

    // simple pagination
    const pageSize = 20;
    const start = (Number(page)-1) * pageSize;
    const slice = items.slice(start, start + pageSize);

    res.json({ items: slice, page: Number(page), pageSize, total: items.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/stays/:id
router.get("/:id", async (req, res) => {
  // Overpass doesn’t give rich details per-ID conveniently.
  // For MVP, return 404 and let FE open the map pin, OR
  // re-run a tiny Overpass query by ID and return tags.
  res.status(501).json({ error: "Details endpoint not implemented for OSM MVP" });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  geocodeCity,
  nearbyLodging,
  toResultItem,
  fetchById, // ✅ added
} = require("../stays/providers/osm");

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
    const raw = await nearbyLodging({
      lat: center.lat,
      lng: center.lng,
      radiusMeters: radius,
    });
    let items = raw.map((e) => toResultItem(e, center));

    // basic filters (OSM rarely has ratings; kept for future enrichment)
    if (type) {
      const wanted = String(type).split(",").map((s) => s.trim());
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
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/stays/:id
router.get("/:id", async (req, res) => {
  try {
    const stay = await fetchById(req.params.id);
    if (!stay) return res.status(404).json({ error: "Not found" });
    res.json(stay);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box, Grid, ToggleButton, ToggleButtonGroup, Switch, Typography, Divider
} from "@mui/material";
import { searchStays } from "../../services/stays";
import StaysSearchBar from "../stays/StaysSearchBar";
import FiltersSidebar from "../stays/FiltersSidebar";
import ResultsList from "../stays/ResultsList";
import MapView from "../stays/MapView";

export default function StaysSearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // URL-state (shareable links)
  const [query, setQuery] = useState({
    dest: params.get("dest") || "Paris",
    distance: Number(params.get("distance") || 3),
    lat: params.get("lat") ? Number(params.get("lat")) : undefined,
    lng: params.get("lng") ? Number(params.get("lng")) : undefined,
  });
  const [filters, setFilters] = useState({
    type: (params.get("type") || "").split(",").filter(Boolean),
    amenities: (params.get("amenities") || "").split(",").filter(Boolean),
    rating: params.get("rating") ? Number(params.get("rating")) : undefined,
  });
  const [view, setView] = useState(params.get("view") || "list"); // list | split | map
  const [translateDynamic, setTranslateDynamic] = useState(params.get("tx") === "on");

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  // push current state back to URL
  const syncUrl = (extra = {}) => {
    const merged = {
      dest: query.dest || undefined,
      distance: query.distance ?? undefined,
      lat: query.lat ?? undefined,
      lng: query.lng ?? undefined,
      type: filters.type?.join(",") || undefined,
      amenities: filters.amenities?.join(",") || undefined,
      rating: filters.rating ?? undefined,
      view,
      tx: translateDynamic ? "on" : undefined,
      ...extra,
    };
    const clean = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined && v !== "")
    );
    setParams(clean, { replace: true });
  };

  const runSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await searchStays({
        ...query,
        type: filters.type?.join(","),
        amenities: filters.amenities?.join(","),
        rating: filters.rating,
        // lang + tx are optional here; can be used later for translations
        lang: localStorage.getItem("lang") || "en",
        tx: translateDynamic ? "on" : "off",
      });
      setItems(data.items || []);
      syncUrl(); // keep URL updated with the latest state
    } catch (e) {
      setError(e?.message || "Failed to fetch stays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid container flexWrap="nowrap"spacing={2} sx={{ p: 2 }}>
      {/* Left column: Search + Filters */}
      <Grid item xs={12} md={3}>
        <StaysSearchBar
          query={query}
          onChange={setQuery}
          onSubmit={() => { syncUrl(); runSearch(); }}
        />
        <Divider sx={{ my: 2 }} />
        <FiltersSidebar
          filters={filters}
          onChange={(next) => setFilters(next)}
          onApply={() => { syncUrl(); runSearch(); }}
        />
      </Grid>

      {/* Right column: Header controls + content */}
      <Grid item xs={12} md={9}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1} gap={2}>
          <ToggleButtonGroup size="small" value={view} exclusive onChange={(_, v) => { if (v) { setView(v); syncUrl({ view: v }); }}}>
            <ToggleButton value="list">List</ToggleButton>
            <ToggleButton value="split">Split</ToggleButton>
            <ToggleButton value="map">Map</ToggleButton>
          </ToggleButtonGroup>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">Translate content</Typography>
            <Switch
              checked={translateDynamic}
              onChange={(e) => { setTranslateDynamic(e.target.checked); syncUrl({ tx: e.target.checked ? "on" : undefined }); }}
            />
          </Box>
        </Box>

        {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}

        {view === "map" && <MapView items={items} />}
        {view === "list" && <ResultsList items={items} loading={loading} />}
        {view === "split" && (
          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
              <ResultsList items={items} loading={loading} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <MapView items={items} />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

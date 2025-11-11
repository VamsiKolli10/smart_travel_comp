import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Container, Grid, Paper, TextField, Button, InputAdornment, CircularProgress, Alert, Typography, Chip, Card, CardContent, CardMedia, Stack, useTheme, useMediaQuery } from "@mui/material";
import { Search as SearchIcon, MyLocation as MyLocationIcon } from "@mui/icons-material";
import { searchPOIs } from "../../services/poi";
import { useAnalytics } from "../../contexts/AnalyticsContext.jsx";

const CATEGORY_CHIPS = [
  { key: "museum", label: "Museum", icon: "🖼️" },
  { key: "hike", label: "Hike", icon: "🏞️" },
  { key: "viewpoint", label: "Viewpoint", icon: "⛰️" },
  { key: "food", label: "Food", icon: "🍜" },
];

// Removed duration chips per request

export default function DiscoverPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { track } = useAnalytics();

  const [query, setQuery] = useState({
    dest: params.get("dest") || "",
    lat: params.get("lat") ? Number(params.get("lat")) : undefined,
    lng: params.get("lng") ? Number(params.get("lng")) : undefined,
  });

  const [filters, setFilters] = useState({
    category: (params.get("category") || "").split(",").filter(Boolean),
    kidFriendly: params.get("kidFriendly") === "true",
    accessibility: params.get("accessibility") === "true",
  });

  // Map/List views are removed. Always show card list.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const toAbsoluteUrl = (maybeRelative) => {
    if (!maybeRelative) return maybeRelative;
    if (maybeRelative.startsWith("http://") || maybeRelative.startsWith("https://")) {
      return maybeRelative;
    }
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const cleanBase = baseURL.replace(/\/api$/, "");
    return `${cleanBase}${maybeRelative}`;
  };

  const queryParams = useMemo(() => {
    const entries = Object.entries({
      dest: query.dest,
      lat: query.lat,
      lng: query.lng,
      category: filters.category,
      kidFriendly: filters.kidFriendly,
      accessibility: filters.accessibility,
    });
    return entries.reduce((acc, [k, v]) => {
      if (v === undefined || v === null || v === "") return acc;
      if (Array.isArray(v)) acc.set(k, v.join(","));
      else acc.set(k, String(v));
      return acc;
    }, new URLSearchParams());
  }, [query, filters]);

  useEffect(() => {
    setParams(queryParams, { replace: true });
  }, [queryParams, setParams]);

  // Helper so we can search with fresh local state right after a click
  const performSearch = async (
    localQuery = query,
    localFilters = filters
  ) => {
    setHasSearched(true);
    setLoading(true);
    setError("");
    try {
      const { items } = await searchPOIs({
        dest: localQuery.dest,
        lat: localQuery.lat,
        lng: localQuery.lng,
        category: localFilters.category.join(","),
        kidFriendly: localFilters.kidFriendly,
        accessibility: localFilters.accessibility,
      });
      setResults(items || []);
      track?.("discover_search", { ...localQuery, ...localFilters });
    } catch (e) {
      console.error("Discover search error", e);
      const apiMsg = e?.response?.data?.error?.message || e?.message || "";
      setError(
        apiMsg
          ? `Failed to fetch places: ${apiMsg}`
          : "Failed to fetch places. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const runSearch = () => {
    const hasDest = query.dest && query.dest.trim();
    const hasCoords = query.lat && query.lng;
    if (!hasDest && !hasCoords) {
      // Do not call API without a valid location
      return;
    }
    // If a destination is provided, prefer it over stale coordinates
    const localQuery = hasDest ? { ...query, lat: undefined, lng: undefined } : query;
    performSearch(localQuery, filters);
  };

  useEffect(() => {
    // Auto-search only if a valid location is present
    if ((query.dest && query.dest.trim()) || (query.lat && query.lng)) {
      runSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const nextQuery = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        dest: "",
      };
      setQuery(nextQuery);
      // Immediately search with new coordinates
      performSearch(nextQuery, filters);
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search city, country, or attraction"
              value={query.dest}
              onChange={(e) => {
                const val = e.target.value;
                setQuery((q) => ({ ...q, dest: val, lat: val ? undefined : q.lat, lng: val ? undefined : q.lng }));
              }}
              InputProps={{ startAdornment: (
                <InputAdornment position="start"><SearchIcon /></InputAdornment>
              ) }}
              onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
            />
          </Grid>
          {/* Distance input removed */}
          <Grid item xs={12} md="auto">
            <Button variant="outlined" startIcon={<MyLocationIcon />} onClick={handleNearMe}>Near me</Button>
          </Grid>
          {/* Map/List view controls removed intentionally */}
        </Grid>
        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {CATEGORY_CHIPS.map((c) => (
            <Chip
              key={c.key}
              label={`${c.icon} ${c.label}`}
              color={filters.category.includes(c.key) ? "primary" : "default"}
              onClick={() => {
                const sel = new Set(filters.category);
                sel.has(c.key) ? sel.delete(c.key) : sel.add(c.key);
                const nextFilters = { ...filters, category: Array.from(sel) };
                setFilters(nextFilters);
                performSearch(query, nextFilters);
              }}
            />
          ))}
          <Chip
            label="Kid-friendly"
            color={filters.kidFriendly ? "primary" : "default"}
            onClick={() => {
              const nextFilters = { ...filters, kidFriendly: !filters.kidFriendly };
              setFilters(nextFilters);
              performSearch(query, nextFilters);
            }}
          />
          <Chip
            label="Accessible"
            color={filters.accessibility ? "primary" : "default"}
            onClick={() => {
              const nextFilters = { ...filters, accessibility: !filters.accessibility };
              setFilters(nextFilters);
              performSearch(query, nextFilters);
            }}
          />
          {/* Removed: Open now, duration chips, Free/Paid chips */}
        </Box>
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={runSearch} startIcon={<SearchIcon />}>Search</Button>
        </Box>
      </Paper>

      {/* Error message removed per request */}

      <Grid container spacing={2}>
        {loading && (
          <Grid item xs={12}><Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box></Grid>
        )}
        {/* Empty-state message removed per request */}
        {!loading && results.map((item) => (
          <Grid key={item.id} item xs={12} md={6} lg={4}>
            <Card onClick={() => navigate(`/destinations/${encodeURIComponent(item.id)}`)} sx={{ cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}>
              {item.thumbnail && (
                <CardMedia component="img" height={180} image={toAbsoluteUrl(item.thumbnail)} alt={item.name} />
              )}
              <CardContent>
                <Typography variant="h6" sx={{ mb: 0.5 }}>{item.name}</Typography>
                {item.blurb && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{item.blurb}</Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  {item.categories?.slice(0, 4).map((t) => <Chip key={t} label={t.replaceAll("_", " ")} size="small" />)}
                  {item.openNow && <Chip color="success" label="Open now" size="small" />}
                  {item.badges?.map((b) => <Chip key={b} label={b} size="small" />)}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

// src/components/pages/StaysSearchPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Divider,
  Button,
  TextField,
} from "@mui/material";

import { searchStays } from "../../services/stays";        // ✅ ONLY searchStays
import FiltersSidebar from "../stays/FiltersSidebar";
import ResultsList from "../stays/ResultsList";
import MapView from "../stays/MapView";

export default function StaysSearchPage() {
  const [params, setParams] = useSearchParams();

  // URL-backed state
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
  const [page, setPage] = useState(Number(params.get("page") || 1));

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  // Sync state to URL (shareable links)
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
      page,
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
        page,
      });
      setItems(data.items || []);
      syncUrl();
    } catch (e) {
      setError(e?.message || "Failed to fetch stays");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initial load

  // ——— UI bits used in the left column ———
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next = { ...query, lat: coords.latitude, lng: coords.longitude };
        delete next.dest;
        setQuery(next);
        setPage(1);
        runSearch();
      },
      () => {}
    );
  };

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {/* Left: Search + Filters */}
      <Grid item xs={12} md={3}>
        <Box display="grid" gap={1}>
          <TextField
            size="small"
            label="Destination"
            value={query.dest || ""}
            onChange={(e) => setQuery((q) => ({ ...q, dest: e.target.value }))}
            helperText="City name (or use my location)"
          />
          <TextField
            size="small"
            label="Distance (km)"
            type="number"
            value={query.distance ?? 3}
            onChange={(e) =>
              setQuery((q) => ({ ...q, distance: Number(e.target.value) }))
            }
          />
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              onClick={() => {
                setPage(1);
                runSearch();
              }}
            >
              Search
            </Button>
            <Button variant="outlined" onClick={useMyLocation}>
              Use my location
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <FiltersSidebar
          filters={filters}
          onChange={setFilters}
          onApply={() => {
            setPage(1);
            runSearch();
          }}
        />
      </Grid>

      {/* Right: View toggle + content */}
      <Grid item xs={12} md={9}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
          gap={2}
          flexWrap="wrap"
        >
          <ToggleButtonGroup
            size="small"
            value={view}
            exclusive
            onChange={(_, v) => {
              if (!v) return;
              setView(v);
              syncUrl({ view: v });
            }}
          >
            <ToggleButton value="list">LIST</ToggleButton>
            <ToggleButton value="split">SPLIT</ToggleButton>
            <ToggleButton value="map">MAP</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

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

        {/* Simple pagination */}
        <Box mt={2} display="flex" gap={1} alignItems="center">
          <Button
            size="small"
            disabled={page <= 1}
            onClick={() => {
              const next = page - 1;
              setPage(next);
              runSearch();
            }}
          >
            Prev
          </Button>
          <Button
            size="small"
            onClick={() => {
              const next = page + 1;
              setPage(next);
              runSearch();
            }}
          >
            Next
          </Button>
          <Typography variant="body2">Page {page}</Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

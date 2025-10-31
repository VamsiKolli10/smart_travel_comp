import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  MyLocation as MyLocationIcon,
  Map as MapIcon,
  ViewList as ListIcon,
  ViewWeek as SplitIcon,
} from "@mui/icons-material";
import { searchStays } from "../../services/stays";
import FiltersSidebar from "../stays/FiltersSidebar";
import ResultsList from "../stays/ResultsList";
import MapView from "../stays/MapView";

export default function StaysSearchPage() {
  const [params, setParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [query, setQuery] = useState({
    dest: params.get("dest") || "",
    distance: Number(params.get("distance") || 3),
    lat: params.get("lat") ? Number(params.get("lat")) : undefined,
    lng: params.get("lng") ? Number(params.get("lng")) : undefined,
  });

  const [filters, setFilters] = useState({
    type: (params.get("type") || "").split(",").filter(Boolean),
    amenities: (params.get("amenities") || "").split(",").filter(Boolean),
    rating: params.get("rating") ? Number(params.get("rating")) : undefined,
  });

  const [view, setView] = useState(params.get("view") || "list");
  const [page, setPage] = useState(Number(params.get("page") || 1));
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

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

  // Fixed: performSearch accepts query as parameter to avoid async state delays
  const performSearch = async (searchQuery = query) => {
    setLoading(true);
    setError("");
    try {
      const data = await searchStays({
        ...searchQuery,
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

  const runSearch = () => {
    performSearch(query);
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fixed: useMyLocation now properly triggers search with coordinates
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        // Create new query with coordinates
        const nextQuery = {
          lat: coords.latitude,
          lng: coords.longitude,
          distance: query.distance,
        };

        // Update state for display
        setQuery(nextQuery);
        setPage(1);

        // Perform search immediately with new query
        performSearch(nextQuery).catch((err) => {
          setError(err?.message || "Search failed");
          setLoading(false);
        });
      },
      (error) => {
        setLoading(false);
        // Handle geolocation errors properly
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError(
              "Location permission denied. Please enable location access in your browser settings."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            setError("The request to get your location timed out.");
            break;
          default:
            setError("An error occurred while retrieving your location.");
        }
        console.error("Geolocation error:", error);
      }
    );
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3} flexDirection="column">
          {/* Header */}
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Find Accommodations
            </Typography>
          </Grid>
          <Grid container flexWrap={"nowrap"}>
            {/* LEFT SIDEBAR - Filters */}
            {!isMobile && (
              <Grid item xs={12} md={3}>
                <Card sx={{ position: "sticky", top: 20 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Search Bar */}
                    <Box sx={{ mb: 2.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Destination"
                        value={query.dest || ""}
                        onChange={(e) =>
                          setQuery((q) => ({ ...q, dest: e.target.value }))
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />
                    </Box>

                    {/* Distance */}
                    <Box sx={{ mb: 2.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Distance (km)"
                        value={query.distance || 3}
                        onChange={(e) =>
                          setQuery((q) => ({
                            ...q,
                            distance: Number(e.target.value),
                          }))
                        }
                        variant="outlined"
                      />
                    </Box>

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mb: 2.5,
                        flexDirection: "column",
                      }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setPage(1);
                          runSearch();
                        }}
                        disabled={loading}
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SearchIcon />
                          )
                        }
                      >
                        Search
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={useMyLocation}
                        disabled={loading}
                        startIcon={<MyLocationIcon />}
                      >
                        My Location
                      </Button>
                    </Box>

                    {/* Filters */}
                    <FiltersSidebar
                      filters={filters}
                      onChange={setFilters}
                      onApply={() => {
                        setPage(1);
                        performSearch(query);
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* RIGHT CONTENT */}
            <Grid
              container
              flexDirection={"column"}
              flexGrow={1}
              item
              xs={12}
              md={isMobile ? 12 : 9}
            >
              {/* Mobile Search Bar */}
              {isMobile && (
                <Card sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Destination"
                        value={query.dest || ""}
                        onChange={(e) =>
                          setQuery((q) => ({ ...q, dest: e.target.value }))
                        }
                      />
                      <Button
                        variant="contained"
                        onClick={() => {
                          setPage(1);
                          runSearch();
                        }}
                        disabled={loading}
                        sx={{ px: 3 }}
                      >
                        {loading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SearchIcon />
                        )}
                      </Button>
                    </Box>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={useMyLocation}
                      disabled={loading}
                      startIcon={<MyLocationIcon />}
                    >
                      Use My Location
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* View Toggle */}
              <Card sx={{ mb: 2.5 }}>
                <CardContent
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={(e, newView) => {
                      if (newView) {
                        setView(newView);
                        syncUrl({ view: newView });
                      }
                    }}
                    size="small"
                  >
                    <ToggleButton value="list" aria-label="list">
                      <ListIcon sx={{ mr: 0.5 }} />
                      List
                    </ToggleButton>
                    <ToggleButton value="split" aria-label="split">
                      <SplitIcon sx={{ mr: 0.5 }} />
                      Split
                    </ToggleButton>
                    <ToggleButton value="map" aria-label="map">
                      <MapIcon sx={{ mr: 0.5 }} />
                      Map
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Typography variant="body2" color="textSecondary">
                    {loading ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CircularProgress size={16} />
                        Searching...
                      </Box>
                    ) : (
                      `${items.length} results`
                    )}
                  </Typography>
                </CardContent>
              </Card>

              {/* Error Alert */}
              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2.5 }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              {/* Content */}
              <Box sx={{ minHeight: "500px" }}>
                {view === "map" && (
                  <Card>
                    <Box sx={{ height: 600 }}>
                      <MapView items={items} loading={loading} />
                    </Box>
                  </Card>
                )}

                {view === "list" && (
                  <ResultsList items={items} loading={loading} />
                )}

                {view === "split" && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <ResultsList items={items} loading={loading} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <Box sx={{ height: 600 }}>
                          <MapView items={items} loading={loading} />
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </Box>

              {/* Pagination */}
              {!loading && items.length > 0 && (
                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="outlined"
                    disabled={page === 1}
                    onClick={() => {
                      setPage(page - 1);
                      performSearch(query);
                    }}
                  >
                    Previous
                  </Button>
                  <Paper sx={{ px: 2, py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Page {page}
                    </Typography>
                  </Paper>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setPage(page + 1);
                      performSearch(query);
                    }}
                  >
                    Next
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

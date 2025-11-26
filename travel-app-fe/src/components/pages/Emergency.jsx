import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Grid,
  IconButton,
  MenuItem,
  CircularProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Phone as PhoneIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import PageContainer from "../layout/PageContainer";
import Button from "../common/Button";
import emergencyNumbersByCountry from "../../data/emergencyNumbersByCountry";
import emergencyLocationAliases from "../../data/emergencyLocationAliases";
import useTravelContext from "../../hooks/useTravelContext";
import { resolveLocation } from "../../services/location";

const emergencyTips = [
  {
    title: "Stay Calm",
    description: "Take a deep breath, assess the scene, and act decisively.",
    icon: "🧘",
  },
  {
    title: "Know Your Location",
    description: "Be ready to describe your address or nearby landmarks.",
    icon: "📍",
  },
  {
    title: "Share Your Plans",
    description: "Tell a trusted contact where you are and who you're with.",
    icon: "📱",
  },
  {
    title: "Keep Documents",
    description: "Carry IDs, insurance, and emergency contacts at all times.",
    icon: "📄",
  },
];

const SERVICE_META = [
  { id: "police", label: "Police", icon: "🚓", color: "#1976d2" },
  { id: "ambulance", label: "Ambulance", icon: "🚑", color: "#d32f2f" },
  { id: "fire", label: "Fire", icon: "🚒", color: "#ff9800" },
];

export default function Emergency() {
  const [activeCall, setActiveCall] = useState(null);
  const [countryQuery, setCountryQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchedEntry, setSearchedEntry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const locationCacheRef = useRef(new Map());
  const fallbackNumber = "911";
  const {
    destination,
    destinationDisplayName,
    destinationCity,
    destinationCountry,
    setDestinationContext,
  } = useTravelContext();
  const contextLocation = useMemo(
    () =>
      (
        destinationCity ||
        destinationDisplayName ||
        destination ||
        destinationCountry ||
        ""
      ).trim(),
    [destinationCity, destinationCountry, destinationDisplayName, destination]
  );
  const contextCountry = useMemo(
    () => (destinationCountry || "").trim(),
    [destinationCountry]
  );

  const alertNumber = useMemo(() => {
    if (!searchedEntry) return fallbackNumber;
    const candidates = [
      searchedEntry.police,
      searchedEntry.ambulance,
      searchedEntry.fire,
    ].filter((value) => value && value !== "—");
    return candidates[0] || fallbackNumber;
  }, [searchedEntry]);

  const countryLookup = useMemo(() => {
    const map = new Map();
    emergencyNumbersByCountry.forEach((entry) => {
      map.set(entry.country.toLowerCase(), entry);
    });
    return map;
  }, []);

  const countryOptions = useMemo(() => {
    return emergencyNumbersByCountry
      .map((entry) => entry.country)
      .sort((a, b) => a.localeCompare(b));
  }, []);

  const aliasLookup = useMemo(() => {
    const map = new Map();
    emergencyLocationAliases.forEach(({ name, country }) => {
      if (!name || !country) return;
      const key = name.trim().toLowerCase();
      if (!key || map.has(key)) return;
      map.set(key, country);
    });
    return map;
  }, []);

  const getCachedLocation = (q) => {
    const key = q.trim().toLowerCase();
    const entry = locationCacheRef.current.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      locationCacheRef.current.delete(key);
      return null;
    }
    return entry.value;
  };

  const setCachedLocation = (q, value) => {
    const key = q.trim().toLowerCase();
    const ttlMs = 5 * 60 * 1000; // 5 minutes
    locationCacheRef.current.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  };

  const findCountryEntry = (value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;

    const aliasCountry = aliasLookup.get(normalized);
    if (aliasCountry) {
      return countryLookup.get(aliasCountry.toLowerCase());
    }

    const partialAlias = emergencyLocationAliases.find((alias) =>
      alias.name.toLowerCase().includes(normalized)
    );
    if (partialAlias) {
      return countryLookup.get(partialAlias.country.toLowerCase());
    }

    if (countryLookup.has(normalized)) {
      return countryLookup.get(normalized);
    }
    return emergencyNumbersByCountry.find((entry) =>
      entry.country.toLowerCase().includes(normalized)
    );
  };

  const runCountrySearch = async (rawValue = countryQuery, options = {}) => {
    if (!rawValue.trim()) {
      setSearchedEntry(null);
      setSearchError("Enter a country name to search.");
      setSelectedCountry("");
      if (!options.skipManualReset) setIsManualEditing(false);
      return;
    }
    const trimmedValue = rawValue.trim();
    setSearchError("");

    // Try geocoding first (cached)
    setLocationLoading(true);
    let resolved = null;
    try {
      const cached = getCachedLocation(trimmedValue);
      if (cached !== null) {
        resolved = cached;
      } else {
        resolved = await resolveLocation(trimmedValue);
        setCachedLocation(trimmedValue, resolved);
      }
    } catch (e) {
      console.error("Location resolve failed", e);
      setCachedLocation(trimmedValue, null);
    } finally {
      setLocationLoading(false);
    }

    const resolvedCountry =
      resolved?.country && resolved.country.trim()
        ? resolved.country.trim()
        : null;

    const match =
      (resolvedCountry && findCountryEntry(resolvedCountry)) ||
      findCountryEntry(trimmedValue);

    if (!match) {
      setSearchedEntry(null);
      setSelectedCountry("");
      setSearchError(`No emergency data found for "${rawValue}".`);
      if (!options.skipManualReset) setIsManualEditing(false);
      return;
    }

    setSearchedEntry(match);
    // Use canonical country label from emergency dataset so the select matches an option
    const canonicalCountry =
      match.country?.trim() ||
      (resolvedCountry && resolvedCountry.trim()) ||
      "";
    setSelectedCountry(canonicalCountry);
    setSearchError("");
    const displayLabel = resolved?.display || trimmedValue || match.country;
    const derivedCity =
      resolved?.city ||
      resolved?.state ||
      (trimmedValue.toLowerCase() !== match.country.toLowerCase()
        ? trimmedValue
        : "");

    if (setDestinationContext) {
      setDestinationContext(
        displayLabel,
        {
          display: displayLabel,
          city: derivedCity || "",
          state: resolved?.state || "",
          country: canonicalCountry,
          lat: typeof resolved?.lat === "number" ? resolved.lat : undefined,
          lng: typeof resolved?.lng === "number" ? resolved.lng : undefined,
        },
        { source: "emergency" }
      );
    }
    if (!options.skipManualReset) setIsManualEditing(false);
  };

  useEffect(() => {
    if (!contextLocation) return;
    if (isManualEditing) return;
    if (
      contextLocation.toLowerCase() === countryQuery.trim().toLowerCase() ||
      contextLocation.toLowerCase() === selectedCountry.toLowerCase()
    ) {
      return;
    }
    setCountryQuery(contextLocation);
    runCountrySearch(contextLocation, { skipManualReset: true });
  }, [contextLocation, countryQuery, selectedCountry, isManualEditing]);

  useEffect(() => {
    if (!contextCountry) return;
    if (contextCountry === selectedCountry) return;
    setSelectedCountry(contextCountry);
  }, [contextCountry, selectedCountry]);

  useEffect(() => {
    if (!countryQuery.trim()) {
      setSearchedEntry(null);
      setSearchError("");
      setSelectedCountry("");
    }
  }, [countryQuery]);

  const handleCountrySelect = (value) => {
    setIsManualEditing(false);
    setCountryQuery(value);
    setSelectedCountry(value);
    if (value) {
      // Trigger search immediately when country is selected from dropdown
      runCountrySearch(value);
    } else {
      setSearchedEntry(null);
      setSearchError("");
      setSelectedCountry("");
    }
  };

  const essentialContacts = useMemo(() => {
    if (!searchedEntry) return [];
    return SERVICE_META.map((service) => ({
      id: service.id,
      name: service.label,
      number: searchedEntry[service.id] || "",
      icon: service.icon,
      description: `${service.label} response in ${searchedEntry.country}`,
      color: service.color,
    }));
  }, [searchedEntry]);

  const handleCall = (contact) => {
    if (!contact.number) return;
    setActiveCall(contact.id);
    setTimeout(() => setActiveCall(null), 1200);
    window.open(`tel:${contact.number}`);
  };

  const handleCopy = async (number) => {
    try {
      await navigator.clipboard.writeText(number);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  return (
    <PageContainer
      title="Emergency"
      subtitle="Quick access to critical contacts, tips, and safety guidance."
      maxWidth="lg"
    >
      <Stack spacing={3}>
        <Alert
          severity="warning"
          icon={false}
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(255, 152, 0, 0.3)",
            background: "rgba(255, 152, 0, 0.12)",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            ⚠️ If you or someone near you is in immediate danger, call{" "}
            {alertNumber} right away.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share your location and stay on the line until help arrives.
          </Typography>
        </Alert>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Emergency Preparedness
            </Typography>
            <Grid container spacing={2}>
              {emergencyTips.map((tip) => (
                <Grid item xs={12} sm={6} key={tip.title}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: "rgba(33,128,141,0.05)",
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        <Box sx={{ fontSize: 28, lineHeight: 1 }}>
                          {tip.icon}
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {tip.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tip.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", lg: "center" }}
            >
              <TextField
                value={countryQuery}
                onChange={(e) => {
                  setIsManualEditing(true);
                  setCountryQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsManualEditing(false);
                    runCountrySearch();
                  }
                }}
                placeholder="Search a country or city"
                helperText='Examples: "Paris", "New York City"'
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                label="Or pick a country"
                value={selectedCountry || ""}
                onChange={(e) => handleCountrySelect(e.target.value)}
                sx={{ minWidth: { xs: "100%", lg: 240 } }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <span style={{ color: "#999" }}>Select a country</span>
                      );
                    }
                    return selected;
                  },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {countryOptions.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                startIcon={
                  locationLoading ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : (
                    <SearchIcon />
                  )
                }
                onClick={() => {
                  setIsManualEditing(false);
                  runCountrySearch();
                }}
                disabled={locationLoading}
                sx={{ alignSelf: { xs: "stretch", md: "center" } }}
              >
                {locationLoading ? "Searching…" : "Search"}
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Tip: type any capital or state/province name (e.g.,
              &quot;Ontario&quot;, &quot;Seoul&quot;) or pick a country to see
              its emergency numbers.
            </Typography>
            {searchError && (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(33,128,141,0.2)",
                }}
              >
                {searchError}
              </Alert>
            )}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Essential contacts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchedEntry
                    ? `Live numbers for ${searchedEntry.country}.`
                    : "Search a country above to load official numbers."}
                </Typography>
              </Box>
              <Chip
                label={
                  searchedEntry ? searchedEntry.country : "No country selected"
                }
                color={searchedEntry ? "secondary" : "default"}
                variant={searchedEntry ? "filled" : "outlined"}
              />
            </Stack>

            {essentialContacts.length ? (
              <Grid container spacing={2}>
                {essentialContacts.map((contact) => {
                  const disabled = !contact.number;
                  return (
                    <Grid item xs={12} md={6} key={contact.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          borderColor:
                            activeCall === contact.id
                              ? "rgba(33,128,141,0.5)"
                              : "rgba(94,82,64,0.12)",
                        }}
                      >
                        <CardContent
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 3,
                                backgroundColor: `${contact.color}20`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 28,
                              }}
                            >
                              {contact.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600 }}
                              >
                                {contact.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {contact.description}
                              </Typography>
                            </Box>
                          </Stack>

                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {contact.number || "—"}
                          </Typography>

                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PhoneIcon fontSize="small" />}
                              onClick={() => handleCall(contact)}
                              disabled={disabled || activeCall === contact.id}
                              sx={{ flexGrow: 1 }}
                            >
                              {disabled
                                ? "Unavailable"
                                : activeCall === contact.id
                                ? "Calling…"
                                : "Call"}
                            </Button>
                            <Tooltip title="Copy number">
                              <span>
                                <IconButton
                                  aria-label="Copy number"
                                  onClick={() => handleCopy(contact.number)}
                                  disabled={disabled}
                                  sx={{
                                    borderRadius: 2,
                                    border: "1px solid rgba(94,82,64,0.12)",
                                  }}
                                >
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Enter a country above to load emergency contacts.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
    </PageContainer>
  );
}

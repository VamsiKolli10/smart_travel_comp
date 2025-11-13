import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Slider,
  Stack,
  Paper,
} from "@mui/material";

const TYPES = [
  { value: "hotel", label: "Hotel" },
  { value: "hostel", label: "Hostel" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "motel", label: "Motel" },
  { value: "apartment", label: "Apartment" },
];

const AMENITIES = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "parking", label: "Parking" },
  { value: "pool", label: "Pool" },
  { value: "spa", label: "Spa" },
  { value: "fitness", label: "Fitness" },
  { value: "breakfast", label: "Breakfast" },
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "accessible", label: "Accessible" },
  { value: "accessible-parking", label: "Accessible Parking" },
  { value: "open-now", label: "Open Now" },
  { value: "open-24h", label: "Open 24h" },
  { value: "operational", label: "Operational" },
];

const QUICK_RATINGS = [3, 4, 4.5];
const AUTO_APPLY_DELAY = 400;

export default function FiltersSidebar({ filters, onChange, onApply }) {
  const [local, setLocal] = useState(filters || {});
  const [pendingAutoApply, setPendingAutoApply] = useState(false);
  const mountedRef = useRef(false);
  const autoApplyTimerRef = useRef(null);

  useEffect(() => {
    setLocal(filters || {});
    setPendingAutoApply(false);
    if (!mountedRef.current) {
      mountedRef.current = true;
    }
  }, [filters]);

  useEffect(() => {
    if (!mountedRef.current || !pendingAutoApply) {
      return undefined;
    }

    if (autoApplyTimerRef.current) {
      clearTimeout(autoApplyTimerRef.current);
    }
    autoApplyTimerRef.current = setTimeout(() => {
      applyFilters(local, { closePanel: false, reason: "auto" });
      setPendingAutoApply(false);
    }, AUTO_APPLY_DELAY);

    return () => {
      if (autoApplyTimerRef.current) {
        clearTimeout(autoApplyTimerRef.current);
        autoApplyTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, pendingAutoApply]);

  const toggle = (list = [], value) =>
    list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];

  const queueAutoApply = () => {
    if (!mountedRef.current) return;
    setPendingAutoApply(true);
  };

  const applyFilters = (nextFilters, options = {}) => {
    const payload = {
      type: nextFilters.type || [],
      amenities: nextFilters.amenities || [],
      rating: nextFilters.rating,
    };
    if (onChange) onChange(payload);
    if (onApply) onApply(payload, options);
  };

  const resetFilters = () => {
    const cleared = { type: [], amenities: [], rating: undefined };
    setLocal(cleared);
    setPendingAutoApply(false);
    applyFilters(cleared);
  };

  const updateLocal = (updater) => {
    setLocal((prev) => {
      const next =
        typeof updater === "function" ? updater(prev || {}) : updater;
      return next;
    });
    queueAutoApply();
  };

  return (
    <Stack spacing={3}>
      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, p: 2, backgroundColor: "background.paper" }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Minimum rating
        </Typography>
        <Slider
          value={local.rating ?? 0}
          onChange={(_, value) =>
            updateLocal((prev) => ({
              ...(prev || {}),
              rating: value === 0 ? undefined : value,
            }))
          }
          min={0}
          max={5}
          step={0.1}
          marks={[
            { value: 0, label: "Any" },
            { value: 3, label: "3+" },
            { value: 4, label: "4+" },
            { value: 5, label: "5" },
          ]}
          valueLabelDisplay="auto"
          sx={{ mb: 1.5 }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {QUICK_RATINGS.map((value) => {
            const active = local.rating === value;
            return (
              <Chip
                key={value}
                label={`${value}+`}
                color={active ? "primary" : "default"}
                variant={active ? "filled" : "outlined"}
                onClick={() =>
                  updateLocal((prev) => ({
                    ...(prev || {}),
                    rating: active ? undefined : value,
                  }))
                }
                size="small"
              />
            );
          })}
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, p: 2, backgroundColor: "background.paper" }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Accommodation type
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Mix & match to narrow down results.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
          {TYPES.map((type) => {
            const active = local.type?.includes(type.value);
            return (
              <Chip
                key={type.value}
                label={type.label}
                color={active ? "primary" : "default"}
                variant={active ? "filled" : "outlined"}
                onClick={() =>
                  updateLocal((prev) => ({
                    ...(prev || {}),
                    type: toggle(prev.type || [], type.value),
                  }))
                }
                sx={{ mb: 1 }}
              />
            );
          })}
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, p: 2, backgroundColor: "background.paper" }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Amenities & perks
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Filter by features surfaced from Google Places.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {AMENITIES.map((amenity) => {
              const active = local.amenities?.includes(amenity.value);
              return (
                <Chip
                  key={amenity.value}
                  label={amenity.label}
                  color={active ? "primary" : "default"}
                  variant={active ? "filled" : "outlined"}
                  onClick={() =>
                    updateLocal((prev) => ({
                      ...(prev || {}),
                      amenities: toggle(
                        prev.amenities || [],
                        amenity.value
                      ),
                    }))
                  }
                  sx={{ mb: 1 }}
                />
              );
            })}
          </Stack>
        </Box>
      </Paper>

      <Divider sx={{ my: 1 }} />

      <Stack direction="column" spacing={1}>
        <Button
          variant="contained"
          onClick={() => {
            setPendingAutoApply(false);
            applyFilters(local);
          }}
          size="small"
        >
          Apply filters
        </Button>
        <Button variant="text" size="small" onClick={resetFilters}>
          Reset
        </Button>
      </Stack>
    </Stack>
  );
}

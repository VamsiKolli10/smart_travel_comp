// src/components/stays/FiltersSidebar.jsx
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";

const TYPES = ["hotel", "hostel", "guesthouse", "motel", "apartment"];
// Amenities that match what the backend can provide (from Google Places API)
const AMENITIES = ["wifi", "parking", "pool", "spa", "fitness", "breakfast", "restaurant", "bar"];

export default function FiltersSidebar({ filters, onChange, onApply }) {
  const [local, setLocal] = useState(filters || {});

  // Sync local state when filters prop changes
  useEffect(() => {
    setLocal(filters || {});
  }, [filters]);
  const [expandedSections, setExpandedSections] = useState({
    rating: true,
    types: true,
    amenities: true,
  });

  const toggle = (list = [], v) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <Box>
      {/* Rating Filter */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          onClick={() => toggleSection("rating")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
            p: 1,
            textTransform: "none",
            color: "inherit",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Minimum Rating
          </Typography>
          {expandedSections.rating ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>

        <Collapse in={expandedSections.rating} timeout={300}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Rating (0-5)"
            inputProps={{ min: 0, max: 5, step: 0.1 }}
            value={local.rating ?? ""}
            onChange={(e) =>
              setLocal((s) => ({
                ...s,
                rating: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            helperText="Optional"
            variant="outlined"
          />
        </Collapse>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Accommodation Types */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          onClick={() => toggleSection("types")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
            p: 1,
            textTransform: "none",
            color: "inherit",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Accommodation Type
          </Typography>
          {expandedSections.types ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>

        <Collapse in={expandedSections.types} timeout={300}>
          <FormGroup>
            {TYPES.map((t) => (
              <FormControlLabel
                key={t}
                control={
                  <Checkbox
                    size="small"
                    checked={local.type?.includes(t) || false}
                    onChange={() =>
                      setLocal((s) => ({
                        ...s,
                        type: toggle(s.type || [], t),
                      }))
                    }
                  />
                }
                label={
                  <Typography variant="body2">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Collapse>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Amenities */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          onClick={() => toggleSection("amenities")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
            p: 1,
            textTransform: "none",
            color: "inherit",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Amenities
          </Typography>
          {expandedSections.amenities ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Button>

        <Collapse in={expandedSections.amenities} timeout={300}>
          <FormGroup>
            {AMENITIES.map((a) => (
              <FormControlLabel
                key={a}
                control={
                  <Checkbox
                    size="small"
                    checked={local.amenities?.includes(a) || false}
                    onChange={() =>
                      setLocal((s) => ({
                        ...s,
                        amenities: toggle(s.amenities || [], a),
                      }))
                    }
                  />
                }
                label={
                  <Typography variant="body2">{a.toUpperCase()}</Typography>
                }
              />
            ))}
          </FormGroup>
        </Collapse>
      </Box>

      {/* Apply Button */}
      <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            const newFilters = {
              type: local.type || [],
              amenities: local.amenities || [],
              rating: local.rating,
            };
            onChange(newFilters);
            onApply(newFilters);
          }}
          size="small"
        >
          Apply Filters
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            const clearedFilters = {
              type: [],
              amenities: [],
              rating: undefined,
            };
            setLocal(clearedFilters);
            onChange(clearedFilters);
            onApply(clearedFilters);
          }}
          size="small"
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
}

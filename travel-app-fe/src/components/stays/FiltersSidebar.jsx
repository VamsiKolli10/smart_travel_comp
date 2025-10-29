import { Box, Typography, FormGroup, FormControlLabel, Checkbox, TextField, Button, Divider } from "@mui/material";
import { useState } from "react";

const TYPES = ["hotel", "hostel", "guesthouse", "motel", "apartment"];
const AMENITIES = ["wifi", "parking", "kitchen", "ac", "pool"]; // best-effort for OSM

export default function FiltersSidebar({ filters, onChange, onApply }) {
  const [local, setLocal] = useState(filters || {});
  const toggle = (list = [], v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <Box display="grid" gap={1}>
      <Typography variant="subtitle2">Filters</Typography>

      <TextField
        size="small"
        label="Min Rating (0-5)"
        type="number"
        inputProps={{ min: 0, max: 5, step: 0.1 }}
        value={local.rating ?? ""}
        onChange={(e) => setLocal((s) => ({ ...s, rating: e.target.value ? Number(e.target.value) : undefined }))}
        helperText="OSM often lacks ratings — optional."
      />

      <Divider />

      <Typography variant="caption">Types</Typography>
      <FormGroup sx={{ ml: 1 }}>
        {TYPES.map((t) => (
          <FormControlLabel
            key={t}
            control={
              <Checkbox
                size="small"
                checked={local.type?.includes(t) || false}
                onChange={() => setLocal((s) => ({ ...s, type: toggle(s.type || [], t) }))}
              />
            }
            label={t}
          />
        ))}
      </FormGroup>

      <Typography variant="caption">Amenities (best-effort)</Typography>
      <FormGroup sx={{ ml: 1 }}>
        {AMENITIES.map((a) => (
          <FormControlLabel
            key={a}
            control={
              <Checkbox
                size="small"
                checked={local.amenities?.includes(a) || false}
                onChange={() => setLocal((s) => ({ ...s, amenities: toggle(s.amenities || [], a) }))}
              />
            }
            label={a}
          />
        ))}
      </FormGroup>

      <Button variant="outlined" onClick={() => { onChange(local); onApply(); }}>Apply</Button>
    </Box>
  );
}

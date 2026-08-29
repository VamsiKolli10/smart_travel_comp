import { Box, TextField, Button } from "@mui/material";
import { useState } from "react";

export default function StaysSearchBar({ query, onChange, onSubmit }) {
  const [local, setLocal] = useState(query || {});
  const update = (k, v) => setLocal((prev) => ({ ...prev, [k]: v }));

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next = { ...local, lat: coords.latitude, lng: coords.longitude };
        // optional: clear dest when using GPS
        delete next.dest;
        setLocal(next);
        onChange(next);
        onSubmit();
      },
      () => {}
    );
  };

  return (
    <Box display="grid" gap={1}>
      <TextField
        size="small"
        label="Destination"
        value={local.dest || ""}
        onChange={(e) => update("dest", e.target.value)}
        helperText="City name (or use my location)"
      />
      <TextField
        size="small"
        label="Distance (km)"
        type="number"
        value={local.distance ?? 3}
        onChange={(e) => update("distance", Number(e.target.value))}
      />
      <Box display="flex" gap={1}>
        <Button variant="contained" onClick={() => { onChange(local); onSubmit(); }}>
          Search
        </Button>
        <Button variant="outlined" onClick={useMyLocation}>
          Use my location
        </Button>
      </Box>
    </Box>
  );
}

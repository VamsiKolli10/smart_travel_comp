import { Box, Typography } from "@mui/material";

export default function MapView({ items = [] }) {
  return (
    <Box sx={{ border: "1px dashed #cbd5e1", borderRadius: 2, p: 2, minHeight: 320 }}>
      <Typography variant="body2">[Map placeholder] {items.length} markers</Typography>
    </Box>
  );
}

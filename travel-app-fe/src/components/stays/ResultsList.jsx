import { Card, CardContent, Typography, Box, CardActions, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ResultsList({ items = [], loading }) {
  const nav = useNavigate();
  if (loading) return <Typography>Loading…</Typography>;
  if (!items?.length) return <Typography>No results</Typography>;

  return (
    <Box display="grid" gap={2}>
      {items.map((x) => (
        <Card key={x.id} sx={{ display: "flex", flexDirection: "row" }}>
          <Box sx={{ width: 220, height: 140, bgcolor: "#f3f5f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* OSM has no photos. You can show a placeholder here. */}
            <Typography variant="caption">No photo</Typography>
          </Box>
          <CardContent sx={{ flex: 1 }}>
            <Typography variant="h6">{x.name}</Typography>
            <Typography variant="body2">
              {x.type} • {x.location?.distanceKm ?? "?"} km from center
            </Typography>
            {x.rating != null && <Typography variant="body2">{x.rating}★</Typography>}
            {x.price?.priceLevel != null && (
              <Typography variant="body2">Price level: {x.price.priceLevel}</Typography>
            )}
          </CardContent>
          <CardActions sx={{ alignItems: "center" }}>
            <Button size="small" onClick={() => nav(`/stays/${encodeURIComponent(x.id)}`)}>View</Button>
            {x.provider?.deeplink && (
              <Button size="small" href={x.provider.deeplink} target="_blank">Book</Button>
            )}
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}

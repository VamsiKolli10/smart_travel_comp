import {
  Card,
  CardContent,
  Typography,
  Box,
  CardActions,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ResultsList({ items = [], loading }) {
  const nav = useNavigate();

  if (loading) return <Typography>Loading…</Typography>;
  if (!items?.length) return <Typography>No results</Typography>;

  return (
    <Box display="grid" gap={2}>
      {items.map((x) => {
        const { lat, lng } = x.location || {};
        const gmaps =
          typeof lat === "number" && typeof lng === "number"
            ? `https://www.google.com/maps?q=${lat},${lng}`
            : null;

        return (
          <Card key={x.id} sx={{ display: "flex", flexDirection: "row" }}>
            {/* Thumbnail / placeholder */}
            <Box
              sx={{
                width: 220,
                height: 140,
                bgcolor: "#f3f5f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {/* OSM has no photos. Swap with provider photos later. */}
              <Typography variant="caption">No photo</Typography>
            </Box>

            {/* Main content */}
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {x.name}
              </Typography>

              <Typography variant="body2">
                {x.type} • {x.location?.distanceKm ?? "?"} km from center
              </Typography>

              {x.rating != null && (
                <Typography variant="body2">{x.rating}★</Typography>
              )}

              {x.price?.priceLevel != null && (
                <Typography variant="body2">
                  Price level: {x.price.priceLevel}
                </Typography>
              )}

              {/* Amenity chips */}
              {!!(x.amenities?.length) && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, flexWrap: "wrap" }}
                  useFlexGap
                >
                  {x.amenities.slice(0, 6).map((a) => (
                    <Chip key={a} label={a} size="small" />
                  ))}
                  {x.amenities.length > 6 && (
                    <Chip
                      label={`+${x.amenities.length - 6}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              )}
            </CardContent>

            {/* Actions */}
            <CardActions sx={{ alignItems: "center" }}>
              <Button
                size="small"
                onClick={() => nav(`/stays/${encodeURIComponent(x.id)}`)}
              >
                View
              </Button>

              {x.provider?.deeplink && (
                <Button
                  size="small"
                  href={x.provider.deeplink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book
                </Button>
              )}

              {gmaps && (
                <Button
                  size="small"
                  href={gmaps}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Maps
                </Button>
              )}
            </CardActions>
          </Card>
        );
      })}
    </Box>
  );
}

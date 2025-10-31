import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Grid,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  // MapPin as MapPinIcon,
  Star as StarIcon,
  LocalOffer as LocalOfferIcon,
  Navigation as NavigationIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ResultsList({ items = [], loading }) {
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [bookmarked, setBookmarked] = useState(new Set());

  const toggleBookmark = (id) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} key={i}>
            <Card>
              <CardContent>
                <Skeleton width="80%" sx={{ mb: 1 }} />
                <Skeleton width="60%" sx={{ mb: 1.5 }} />
                <Skeleton width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!items?.length) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          {/* <MapPinIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} /> */}
          <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
            No accommodations found
          </Typography>
          <Typography variant="body2" color="textDisabled">
            Try adjusting your search criteria or distance
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {items.map((item, idx) => {
        const { lat, lng } = item.location || {};
        const gmaps =
          typeof lat === "number" && typeof lng === "number"
            ? `https://www.google.com/maps?q=${lat},${lng}`
            : null;

        return (
          <Card
            key={item.id}
            sx={{
              "&:hover": { boxShadow: theme.shadows[4] },
              transition: "box-shadow 0.3s",
            }}
          >
            {/* Image Placeholder */}
            <Box
              sx={{
                height: 180,
                backgroundColor: theme.palette.action.hover,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {item.type?.toUpperCase()}
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                }}
              >
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(item.id);
                  }}
                  sx={{
                    minWidth: "auto",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    backgroundColor: "white",
                  }}
                >
                  {bookmarked.has(item.id) ? (
                    <BookmarkFilledIcon
                      sx={{ color: theme.palette.primary.main, fontSize: 20 }}
                    />
                  ) : (
                    <BookmarkIcon sx={{ fontSize: 20 }} />
                  )}
                </Button>
              </Box>
              <Typography variant="body2" color="textSecondary">
                📷 No photo available
              </Typography>
            </Box>

            {/* Content */}
            <CardContent sx={{ pb: 1 }}>
              {/* Name & Rating */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {item.name}
                  </Typography>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    {/* <MapPinIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    /> */}
                    <Typography variant="body2" color="textSecondary">
                      {item.location?.distanceKm ?? "?"} km from center
                    </Typography>
                  </Box>
                </Box>

                {/* Rating */}
                {item.rating != null && (
                  <Paper
                    sx={{
                      px: 1.5,
                      py: 1,
                      backgroundColor: theme.palette.action.hover,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <StarIcon sx={{ fontSize: 16, color: "#ffc107" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.rating.toFixed(1)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {item.reviews?.length || 0} reviews
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Price Level */}
              {item.price?.priceLevel != null && (
                <Box sx={{ mb: 1.5 }}>
                  <Chip
                    icon={<LocalOfferIcon />}
                    label={`Price: ${item.price.priceLevel}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              )}

              {/* Amenities */}
              {!!item.amenities?.length && (
                <Box sx={{ mb: 1.5 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 0.75, useFlexGap: true }}
                  >
                    {item.amenities.slice(0, 3).map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {item.amenities.length > 3 && (
                      <Chip
                        label={`+${item.amenities.length - 3}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>
              )}
            </CardContent>

            {/* Actions */}
            <CardActions
              sx={{ pt: 0, gap: 1, flexWrap: isMobile ? "wrap" : "nowrap" }}
            >
              <Button
                fullWidth={isMobile}
                variant="contained"
                size="small"
                onClick={() => nav(`/stays/${encodeURIComponent(item.id)}`)}
              >
                View Details
              </Button>
              {item.provider?.deeplink && (
                <Button
                  fullWidth={isMobile}
                  variant="outlined"
                  size="small"
                  href={item.provider.deeplink}
                  target="_blank"
                >
                  Book
                </Button>
              )}
              {gmaps && (
                <Button
                  fullWidth={isMobile}
                  variant="outlined"
                  size="small"
                  href={gmaps}
                  target="_blank"
                  startIcon={<NavigationIcon />}
                >
                  Map
                </Button>
              )}
            </CardActions>
          </Card>
        );
      })}
    </Stack>
  );
}

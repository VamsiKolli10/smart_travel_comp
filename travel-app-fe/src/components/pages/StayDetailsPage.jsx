import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  Skeleton,
  Grid,
  IconButton,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  // MapPin as MapPinIcon,
  LocalPhone as PhoneIcon,
  Language as WebsiteIcon,
  Star as StarIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
} from "@mui/icons-material";
import { getStay } from "../../services/stays";
import MapView from "../stays/MapView";

export default function StayDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    let on = true;

    (async () => {
      try {
        const out = await getStay(id);
        if (on) setData(out);
      } catch (e) {
        if (on) setErr(e?.message || "Failed to load stay");
      } finally {
        if (on) setLoading(false);
      }
    })();

    return () => {
      on = false;
    };
  }, [id]);

  if (!id) {
    return <Navigate to="/stays" replace />;
  }

  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ mb: 3 }}
          />
          <Skeleton width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton width="40%" height={30} sx={{ mb: 3 }} />
          <Stack spacing={2}>
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={20} width="80%" />
          </Stack>
        </Container>
      </Box>
    );
  }

  if (err) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Alert severity="error">{err}</Alert>
        </Container>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Alert severity="warning">Accommodation not found</Alert>
        </Container>
      </Box>
    );
  }

  const gmaps =
    data.location?.lat && data.location?.lng
      ? `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`
      : null;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        {/* Header with Back Button */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Back
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => setBookmarked(!bookmarked)}
              color={bookmarked ? "primary" : "default"}
            >
              {bookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
            </IconButton>
            <IconButton
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: data.name,
                    text: `Check out ${data.name}`,
                  });
                }
              }}
            >
              <ShareIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              {/* Hero Section */}
              <Box
                sx={{
                  height: 300,
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
                    py: 0.75,
                    borderRadius: 1,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  {data.type?.toUpperCase()}
                </Box>
                <Typography variant="body2" color="textSecondary">
                  📷 Gallery photos coming soon
                </Typography>
              </Box>

              {/* Content Section */}
              <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {data.name}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {/* <MapPinIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        /> */}
                        <Typography variant="body2" color="textSecondary">
                          {data.location?.address || "Address unavailable"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Rating */}
                    {data.rating != null && (
                      <Paper
                        sx={{
                          px: 2,
                          py: 1.5,
                          backgroundColor: theme.palette.action.hover,
                          ml: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <StarIcon sx={{ fontSize: 18, color: "#ffc107" }} />
                          <Typography sx={{ fontWeight: 600 }}>
                            {data.rating.toFixed(1)}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {data.reviews?.length || 0} reviews
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                {/* Overview */}
                {data.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1.5 }}
                    >
                      About
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      {data.description}
                    </Typography>
                  </Box>
                )}

                {/* Amenities */}
                {!!data.amenities?.length && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1.5 }}
                    >
                      Amenities
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap", gap: 1, useFlexGap: true }}
                    >
                      {data.amenities.map((amenity) => (
                        <Chip
                          key={amenity}
                          label={amenity}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Reviews */}
                {!!data.reviews?.length && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1.5 }}
                    >
                      Guest Reviews
                    </Typography>
                    <Stack spacing={2}>
                      {data.reviews.slice(0, 3).map((review, idx) => (
                        <Paper
                          key={idx}
                          sx={{
                            p: 2,
                            backgroundColor: theme.palette.action.hover,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {review.author_name}
                            </Typography>
                            {review.rating && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <StarIcon
                                  sx={{ fontSize: 14, color: "#ffc107" }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {review.rating}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mb: 1 }}
                          >
                            {review.text}
                          </Typography>
                          <Typography variant="caption" color="textDisabled">
                            {review.relative_time_description}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}

                <Divider sx={{ my: 2.5 }} />

                {/* Contact Information */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1.5 }}
                  >
                    Contact Information
                  </Typography>
                  <Stack spacing={1}>
                    {data.phone && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<PhoneIcon />}
                        href={`tel:${data.phone}`}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        {data.phone}
                      </Button>
                    )}
                    {data.website && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<WebsiteIcon />}
                        href={data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ justifyContent: "flex-start" }}
                      >
                        Visit Website
                      </Button>
                    )}
                    {gmaps && (
                      <Button
                        fullWidth
                        variant="contained"
                        // startIcon={<MapPinIcon />}
                        href={gmaps}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Google Maps
                      </Button>
                    )}
                  </Stack>
                </Box>

                {/* Location Map */}
                {/* <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1.5 }}
                  >
                    Location
                  </Typography>
                  <Card>
                    <Box sx={{ height: 350 }}>
                      <MapView
                        items={[{ location: data.location, name: data.name }]}
                        loading={false}
                      />
                    </Box>
                  </Card>
                </Box> */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

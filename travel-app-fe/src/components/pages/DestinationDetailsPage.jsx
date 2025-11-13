import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Chip,
  Paper,
  Stack,
  Button,
  Link,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getPOIDetails } from "../../services/poi";
import PhotoCarousel from "../stays/PhotoCarousel";
import MapView from "../discover/MapView";
// Itinerary planner removed from details page per request

export default function DestinationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Itinerary state removed

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getPOIDetails(id);
        setData(res);
      } catch (e) {
        console.error(e);
        setError("Failed to load destination");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  // Removed auto-generation; planner now lives on destinations home page

  if (loading) return <Container sx={{ py: 6 }}><Typography>Loading…</Typography></Container>;
  if (error) return <Container sx={{ py: 6 }}><Typography color="error">{error}</Typography></Container>;
  if (!data) return null;

  const hero = data.photos?.length ? <PhotoCarousel photos={data.photos} /> : null;
  const openNow = data.openingHours?.length ? data.openingHours : data.openingHours;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate("/destinations");
          }}
        >
          Back
        </Button>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{data.name}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
          {typeof data.rating === "number" && <Chip label={`${data.rating.toFixed(1)}★`} />}
          {data.price?.priceLevel && <Chip label={`Price: ${data.price.priceLevel}`} />}
          {data.badges?.map((b) => <Chip key={b} label={b} />)}
        </Stack>
      </Box>

      {hero}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Overview</Typography>
            <Typography variant="body1" color="text.secondary">{data.description || "No description available."}</Typography>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>How to get there</Typography>
            <Box sx={{ height: 300 }}>
              <MapView items={[{ id: data.id, name: data.name, location: data.location }]} loading={false} interactive={false} />
            </Box>
            {data.provider?.deeplink && (
              <Box sx={{ mt: 1 }}>
                <Button variant="outlined" component={Link} href={data.provider.deeplink} target="_blank" rel="noopener">Open in Maps</Button>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Near this place</Typography>
            <Typography variant="body2" color="text.secondary">Coming soon: nearby POIs with walking distances.</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Practical info</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {Array.isArray(data.openingHours) && data.openingHours.length > 0 && (
                <Box>
                  <Typography variant="subtitle2">Opening hours</Typography>
                  {data.openingHours.map((line, idx) => (
                    <Typography key={idx} variant="body2" color="text.secondary">{line}</Typography>
                  ))}
                </Box>
              )}
              {data.website && (
                <Typography variant="body2">Website: <Link href={data.website} target="_blank" rel="noopener">{data.website}</Link></Typography>
              )}
              {data.phone && (
                <Typography variant="body2">Phone: {data.phone}</Typography>
              )}
              {data.location?.address && (
                <Typography variant="body2">Address: {data.location.address}</Typography>
              )}
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Safety & etiquette</Typography>
            <Typography variant="body2" color="text.secondary">
              Check our Culture module for local etiquette, dress codes, and photography rules.
            </Typography>
          </Paper>

          <Stack direction="row" spacing={1}>
            <Button variant="contained">Save</Button>
            <Button variant="outlined">Add to itinerary</Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

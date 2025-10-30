import { useEffect, useState } from "react";
import { useParams, Navigate, Link as RouterLink } from "react-router-dom";
import { Box, Typography, Stack, Chip, Button, Divider } from "@mui/material";
import { getStay } from "../../services/stays";
import MapView from "../stays/MapView";

export default function StayDetailsPage() {
  const { id } = useParams();
  if (!id) return <Navigate to="/stays" replace />;  // <-- redirect instead of showing text

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
    return () => { on = false; };
  }, [id]);

  if (loading) return <Typography sx={{ p: 2 }}>Loading…</Typography>;
  if (err) return <Typography color="error" sx={{ p: 2 }}>{err}</Typography>;
  if (!data) return <Typography sx={{ p: 2 }}>Not found</Typography>;

  const gmaps = data.location?.lat && data.location?.lng
    ? `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`
    : null;

  return (
    <Box sx={{ p: 2, display: "grid", gap: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">{data.name}</Typography>
        <Button component={RouterLink} to="/stays" variant="outlined">Back to results</Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        {data.location?.address || "Address unavailable"}
      </Typography>

      <Box sx={{ height: 200, bgcolor: "#f3f5f7", borderRadius: 2,
                 display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="caption">No photos available</Typography>
      </Box>

      <Divider />

      <Typography variant="subtitle1">Overview</Typography>
      <Typography variant="body2">{data.description || "No description."}</Typography>

      {!!(data.amenities?.length) && (
        <>
          <Typography variant="subtitle1">Amenities</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {data.amenities.map((a) => <Chip key={a} label={a} size="small" />)}
          </Stack>
        </>
      )}

      <Typography variant="subtitle1">Location</Typography>
      <MapView items={[{ location: { lat: data.location?.lat, lng: data.location?.lng } }]} />

      {gmaps && (
        <Button href={gmaps} target="_blank" rel="noopener noreferrer" variant="contained">
          Open in Maps
        </Button>
      )}
    </Box>
  );
}

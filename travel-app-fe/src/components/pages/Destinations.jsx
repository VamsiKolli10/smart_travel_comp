import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PageContainer from "../layout/PageContainer";
import Button from "../common/Button";
import useTravelContext from "../../hooks/useTravelContext";

const categories = [
  "all",
  "museums",
  "parks",
  "restaurants",
  "shopping",
  "landmarks",
];

const destinations = [
  {
    id: 1,
    name: "Museum of Fine Arts",
    city: "Boston",
    state: "MA",
    country: "USA",
    lat: 42.3394,
    lng: -71.0942,
    category: "museums",
    type: "Museum",
    rating: 4.8,
    distance: "2.3 km",
    icon: "🎨",
    description:
      "World-class art collection spanning 5,000 years of human creativity.",
    hours: "10:00 AM - 5:00 PM",
    price: "$25",
    features: ["Audio Guide", "Cafe", "Gift Shop", "Wheelchair Accessible"],
  },
  {
    id: 2,
    name: "Boston Common",
    city: "Boston",
    state: "MA",
    country: "USA",
    lat: 42.355,
    lng: -71.0656,
    category: "parks",
    type: "Public Park",
    rating: 4.6,
    distance: "1.8 km",
    icon: "🌳",
    description:
      "America's oldest public park, perfect for walking and relaxation.",
    hours: "6:00 AM - 11:30 PM",
    price: "Free",
    features: [
      "Walking Trails",
      "Playground",
      "Historic Site",
      "Dog Friendly",
    ],
  },
  {
    id: 3,
    name: "Faneuil Hall Marketplace",
    city: "Boston",
    state: "MA",
    country: "USA",
    lat: 42.360,
    lng: -71.055,
    category: "shopping",
    type: "Shopping Center",
    rating: 4.4,
    distance: "3.1 km",
    icon: "🛍️",
    description:
      "Historic marketplace with shops, restaurants, and street performers.",
    hours: "10:00 AM - 9:00 PM",
    price: "Free",
    features: ["Food Court", "Street Performers", "Historic", "Gift Shops"],
  },
  {
    id: 4,
    name: "Fenway Park",
    city: "Boston",
    state: "MA",
    country: "USA",
    lat: 42.3467,
    lng: -71.0972,
    category: "landmarks",
    type: "Sports Venue",
    rating: 4.7,
    distance: "4.2 km",
    icon: "⚾",
    description: "Historic baseball stadium, home of the Boston Red Sox.",
    hours: "Varies by game",
    price: "$15+",
    features: ["Tours Available", "Gift Shop", "Historic", "Sports"],
  },
  {
    id: 5,
    name: "Isabella Stewart Gardner Museum",
    city: "Boston",
    state: "MA",
    country: "USA",
    lat: 42.3387,
    lng: -71.0994,
    category: "museums",
    type: "Art Museum",
    rating: 4.5,
    distance: "3.8 km",
    icon: "🏛️",
    description:
      "Unique museum in a Venetian-style palace with beautiful gardens.",
    hours: "11:00 AM - 5:00 PM",
    price: "$20",
    features: ["Gardens", "Historic Building", "Art Collection", "Cafe"],
  },
  {
    id: 6,
    name: "North End",
    city: "Boston",
    state: "MA",
    country: "USA",
    lat: 42.3648,
    lng: -71.0543,
    category: "restaurants",
    type: "Historic District",
    rating: 4.6,
    distance: "2.7 km",
    icon: "🍝",
    description:
      "Boston's Little Italy with authentic Italian restaurants and bakeries.",
    hours: "Varies by restaurant",
    price: "$$",
    features: ["Italian Food", "Historic", "Walking Tours", "Bakeries"],
  },
];

const categoryLabels = {
  all: "All Places",
  museums: "Museums",
  parks: "Parks",
  restaurants: "Restaurants",
  shopping: "Shopping",
  landmarks: "Landmarks",
};

export default function Destinations() {
  const navigate = useNavigate();
  const { setDestinationContext } = useTravelContext();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const handleViewStays = (destination) => {
    setDestinationContext(destination.name, {
      display: destination.name,
      city: destination.city,
      state: destination.state,
      country: destination.country,
      lat: destination.lat,
      lng: destination.lng,
      source: "destinations",
    });
    const params = new URLSearchParams({
      dest: destination.name,
    });
    if (destination.lat && destination.lng) {
      params.set("lat", destination.lat.toString());
      params.set("lng", destination.lng.toString());
    }
    navigate(`/stays?${params.toString()}`);
  };

  const filtered = useMemo(() => {
    return destinations.filter((place) => {
      const matchesCategory =
        activeCategory === "all" || place.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        place.name.toLowerCase().includes(q) ||
        place.description.toLowerCase().includes(q) ||
        place.features.some((feature) =>
          feature.toLowerCase().includes(q)
        );
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <PageContainer
      title="Destinations"
      subtitle="Find the best places to explore, eat, and relax near you."
      maxWidth="lg"
    >
      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Search destinations"
              placeholder="Try “museum”, “historic”, or a specific place"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ pt: 1 }}
            >
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={categoryLabels[category]}
                  color={activeCategory === category ? "primary" : "default"}
                  variant={
                    activeCategory === category ? "filled" : "outlined"
                  }
                  onClick={() => setActiveCategory(category)}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          {filtered.map((destination) => (
            <Grid item xs={12} sm={6} md={4} key={destination.id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        fontSize: 32,
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        backgroundColor: "rgba(33,128,141,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {destination.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {destination.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {destination.type}
                        </Typography>
                        <Chip
                          label={`${destination.rating.toFixed(1)} ★`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {destination.distance}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {destination.description}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {destination.features.slice(0, 3).map((feature) => (
                      <Chip key={feature} label={feature} size="small" />
                    ))}
                    {destination.features.length > 3 && (
                      <Chip
                        label={`+${destination.features.length - 3}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: "auto" }}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Hours
                      </Typography>
                      <Typography variant="body2">
                        {destination.hours}
                      </Typography>
                    </Stack>
                    <Stack spacing={0.5} textAlign="right">
                      <Typography variant="caption" color="text.secondary">
                        Price
                      </Typography>
                      <Typography variant="body2">{destination.price}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderTop: "1px solid rgba(94,82,64,0.12)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={categoryLabels[destination.category]}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleViewStays(destination)}
                  >
                    View nearby stays
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {!filtered.length && (
          <Card>
            <CardContent
              sx={{ textAlign: "center", py: 6, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                No destinations found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try a different keyword or switch to another category to explore more
                places.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </PageContainer>
  );
}

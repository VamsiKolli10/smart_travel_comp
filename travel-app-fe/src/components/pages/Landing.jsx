import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Container,
  useTheme,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Translate as TranslateIcon,
  Hotel as HotelIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import Button from "../common/Button";
import { Link, useNavigate } from "react-router-dom";

export default function Landing() {
  const theme = useTheme();
  const navigate = useNavigate();

  const heroStats = [
    { number: "50K+", label: "Phrases" },
    { number: "120+", label: "Languages" },
    { number: "190+", label: "Countries" },
  ];

  const features = [
    {
      icon: (
        <TranslateIcon
          sx={{ fontSize: 40, color: theme.palette.primary.main }}
        />
      ),
      title: "Instant Translations",
      description: "Translate on the go with history saved to your phrasebook.",
    },
    {
      icon: (
        <HotelIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
      ),
      title: "Find Stays",
      description: "Filter accommodations by price, safety, and amenities.",
    },
    {
      icon: (
        <SecurityIcon
          sx={{ fontSize: 40, color: theme.palette.primary.main }}
        />
      ),
      title: "Emergency Ready",
      description: "Local emergency numbers and quick‑access safety tips.",
    },
  ];

  return (
    <Box>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {/* Smart Travel Companion 🌍 */}
          </Typography>
          <Box>
            <Button
              color="primary"
              onClick={() => navigate("/login")}
              sx={{ mr: 1 }}
            >
              Login
            </Button>
            <Button variant="contained" onClick={() => navigate("/register")}>
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
          padding: { xs: 4, sm: 6, md: 8 },
          textAlign: "center",
          minHeight: { xs: "60vh", sm: "70vh" },
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            gutterBottom
            sx={{
              color: `${theme.palette.primary.main} !important`,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Smart Travel Companion
          </Typography>
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" } }}
          >
            Travel Smarter, Safer, and Happier
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Your all‑in‑one companion for translations, phrasebook, stays,
            emergency help, and cultural tips.
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <Button size="large" variant="contained">
                Open Dashboard
              </Button>
            </Link>
          </Box>

          {/* <Grid
            container
            spacing={{ xs: 2, sm: 4 }}
            sx={{ maxWidth: 600, mx: "auto", justifyContent: "center" }}
          >
            {heroStats.map((stat, index) => (
              <Grid item xs={4} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    color="primary"
                    display="block"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid> */}
        </Container>
      </Box>
      <Box
        sx={{
          padding: { xs: 4, sm: 6, md: 8 },
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {features.map((feature, index) => (
            <Grid
              item
              xs={12}
              md={6}
              flexGrow={1}
              id={`features-${index}`}
              key={index}
            >
              <Card
                sx={{
                  height: "100%",
                  textAlign: "center",
                  transition: "transform 250ms ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

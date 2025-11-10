import { Fragment, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AirplanemodeActive as PlaneIcon,
  Explore as ExploreIcon,
  Language as LanguageIcon,
  LocalActivity as ActivityIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import { ModuleCard, ModuleCardGrid } from "../common/ModuleCard";
import SharedNavbar from "../layout/SharedNavbar";
import "./Landing.css";

const heroAnimation = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export default function Landing() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const heroMetrics = useMemo(
    () => [
      { value: "120K+", label: "Journeys planned", helper: "↑18% this year" },
      {
        value: "190+",
        label: "Curated locales",
        helper: "Across 6 continents",
      },
      { value: "4.9", label: "Average rating", helper: "32K traveler reviews" },
    ],
    []
  );

  const highlightCards = useMemo(
    () => [
      {
        icon: <LanguageIcon color="primary" />,
        title: "Live Translation",
        description:
          "Instant voice and text translation with offline phrasebook sync for your entire crew.",
        badge: "AI powered",
      },
      {
        icon: <ExploreIcon color="primary" />,
        title: "Curated Guides",
        description:
          "Neighbourhood-level insights and etiquette notes prepared with local experts.",
        badge: "Local insights",
      },
      {
        icon: <SecurityIcon color="primary" />,
        title: "Safety Pulse",
        description:
          "Emergency cards, geo alerts, and quick-share routines to keep everyone aligned.",
        badge: "Always on",
      },
      {
        icon: <ActivityIcon color="primary" />,
        title: "Adaptive Itineraries",
        description:
          "Drop in flights and preferences—get dynamic itineraries that flex with weather and crowds.",
        badge: "Dynamic",
      },
    ],
    []
  );

  const itineraries = useMemo(
    () => [
      {
        title: "Kyoto In Bloom",
        subtitle: "7 days · Japan",
        points: ["Tea masterclass", "Hidden shrines", "Sunrise hike"],
        accent: theme.palette.primary.light,
      },
      {
        title: "Nordic Nightfall",
        subtitle: "5 days · Iceland",
        points: ["Aurora chase", "Glacier trek", "Blue lagoon"],
        accent: "#64B5F6",
      },
      {
        title: "Lisbon Slow Tour",
        subtitle: "6 days · Portugal",
        points: ["Tile workshop", "Rooftop fado", "Sunset sail"],
        accent: "#81C784",
      },
    ],
    [theme.palette.primary.light]
  );

  const testimonials = useMemo(
    () => [
      {
        quote:
          "The itinerary builder felt like having a concierge in my pocket. Every recommendation landed perfectly.",
        name: "Riya Patel",
        role: "Solo explorer",
        flag: "🇸🇬",
      },
      {
        quote:
          "Emergency alerts kept our family synced across Paris. Offline phrase cards were a lifesaver.",
        name: "Martin Dupont",
        role: "Family traveler",
        flag: "🇫🇷",
      },
    ],
    []
  );

  return (
    <Box className="landing-root">
      {/* <SharedNavbar isLanding={true} /> */}
      <main>
        <HeroSection
          metrics={heroMetrics}
          onPrimary={() => navigate("/register")}
          onSecondary={() => navigate("/login")}
          isMdUp={isMdUp}
        />
        <HighlightsSection cards={highlightCards} />
        <ItinerarySection
          itineraries={itineraries}
          onPrimary={() => navigate("/login")}
        />
        <TestimonialsSection testimonials={testimonials} />
        <FinalCTA />
      </main>
    </Box>
  );
}

function HeroSection({ metrics, onPrimary, onSecondary, isMdUp }) {
  return (
    <Box sx={{ pt: { xs: 18, md: 22 }, pb: { xs: 10, md: 16 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 6, md: 10 }}
          alignItems={{ xs: "flex-start", md: "center" }}
          component={motion.div}
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          <Stack spacing={3} flex={1}>
            <Chip
              label="Plan. Translate. Thrive."
              color="primary"
              variant="outlined"
              sx={{ alignSelf: "flex-start", fontWeight: 600 }}
              component={motion.div}
              variants={heroAnimation}
            />
            <Typography
              component={motion.h1}
              variants={heroAnimation}
              variant="h2"
              sx={{
                fontSize: { xs: "2.6rem", md: "3.2rem" },
                fontWeight: 600,
                maxWidth: 620,
                letterSpacing: "-0.015em",
              }}
            >
              Craft immersive journeys with a unified travel workspace.
            </Typography>
            <Typography
              component={motion.p}
              variants={heroAnimation}
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 520, fontSize: { md: "1.05rem" } }}
            >
              Bring translations, curated guides, safety briefings, and adaptive
              itineraries into one intuitive hub built for modern explorers who
              want freedom with confidence.
            </Typography>
            <Stack
              component={motion.div}
              variants={heroAnimation}
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
            >
              <Button size="large" variant="contained" onClick={onPrimary}>
                Start your journey
              </Button>
              <Button size="large" variant="outlined" onClick={onSecondary}>
                Preview the dashboard
              </Button>
            </Stack>
          </Stack>
          <Card
            component={motion.div}
            variants={heroAnimation}
            elevation={0}
            sx={{
              flex: isMdUp ? "0 0 360px" : "1",
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.15)",
              background:
                "linear-gradient(160deg, rgba(19,52,59,0.92) 0%, rgba(33,128,141,0.85) 100%)",
              color: "#FCFCF9",
              boxShadow: "0 30px 70px -40px rgba(3,9,18,0.8)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  <PlaneIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                    Live itinerary pulse
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Kyoto in Bloom departs in 3 weeks
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label="Cultural etiquette"
                    variant="outlined"
                    sx={{
                      color: "#FCFCF9",
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  />
                  <Chip
                    label="Offline translator"
                    variant="outlined"
                    sx={{
                      color: "#FCFCF9",
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  />
                  <Chip
                    label="Shared safety brief"
                    variant="outlined"
                    sx={{
                      color: "#FCFCF9",
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  Real-time syncing across your traveling party with cultural
                  nudges, emergency briefs, and translation shortcuts ready when
                  you are.
                </Typography>
              </Stack>
              <Button
                variant="contained"
                color="secondary"
                onClick={onPrimary}
                sx={{ alignSelf: "flex-start" }}
              >
                Build my trip
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

function HighlightsSection({ cards }) {
  return (
    <Container
      maxWidth="lg"
      sx={{ pb: { xs: 10, md: 14 } }}
      className="landing-section-surface"
    >
      <Stack spacing={2.5} sx={{ maxWidth: 640, mb: 4 }}>
        <Chip
          label="Powerful on every journey"
          color="primary"
          variant="outlined"
          sx={{ alignSelf: "flex-start", fontWeight: 600 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          The tools you need before, during, and after takeoff.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Keep language, planning, and safety in sync so you can stay immersed
          in the moments that matter.
        </Typography>
      </Stack>
      <ModuleCardGrid>
        {cards.map((card) => (
          <ModuleCard
            key={card.title}
            sx={{
              border: (theme) =>
                `1px solid ${
                  theme.palette.mode === "dark"
                    ? "rgba(237,242,243,0.14)"
                    : "rgba(94,82,64,0.12)"
                }`,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(16,28,36,0.94)"
                  : "rgba(255,255,255,0.9)",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 30px 80px -48px rgba(2,8,18,0.85)"
                  : "0 24px 70px -45px rgba(12,32,44,0.45)",
            }}
          >
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    backgroundColor: "rgba(33,128,141,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </Box>
                <Chip
                  label={card.badge}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {card.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.description}
              </Typography>
            </CardContent>
          </ModuleCard>
        ))}
      </ModuleCardGrid>
    </Container>
  );
}

function ItinerarySection({ itineraries, onPrimary }) {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(16,32,39,0.85)"
            : "rgba(252,252,249,0.8)",
      }}
      className="landing-section-surface"
    >
      <Container maxWidth="lg">
        <Stack spacing={2.5} sx={{ maxWidth: 640, mb: 4 }}>
          <Chip
            label="Curated adventures"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: "flex-start", fontWeight: 600 }}
          />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Ready-made journeys that adapt to you.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Signature itineraries crafted with local experts stay flexible with
            live updates, collaborative planning, and safety workflows.
          </Typography>
        </Stack>
        <ModuleCardGrid>
          {itineraries.map((trip) => (
            <ModuleCard
              key={trip.title}
              interactive
              sx={{
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(237,242,243,0.14)"
                      : "rgba(94,82,64,0.12)"
                  }`,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(12,22,30,0.94)"
                    : "#FFFFFD",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 32px 90px -46px rgba(2,8,18,0.88)"
                    : "0 24px 70px -45px rgba(12,32,44,0.45)",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    borderRadius: 3,
                    height: 160,
                    background: `linear-gradient(145deg, ${trip.accent} 0%, rgba(250,250,250,0.4) 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  {trip.subtitle}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {trip.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Guided experiences · Flexible itineraries
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  {trip.points.map((point) => (
                    <Typography
                      key={point}
                      variant="body2"
                      color="text.secondary"
                    >
                      • {point}
                    </Typography>
                  ))}
                </Stack>
                <Button
                  variant="contained"
                  onClick={onPrimary}
                  sx={{ alignSelf: "flex-start", mt: "auto" }}
                >
                  View details
                </Button>
              </CardContent>
            </ModuleCard>
          ))}
        </ModuleCardGrid>
      </Container>
    </Box>
  );
}

function TestimonialsSection({ testimonials }) {
  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 10, md: 14 } }}
      className="landing-section-surface"
    >
      <Stack spacing={2.5} sx={{ maxWidth: 640, mb: 4 }}>
        <Chip
          label="Loved by explorers worldwide"
          color="primary"
          variant="outlined"
          sx={{ alignSelf: "flex-start", fontWeight: 600 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Designed for planners, dreamers, and spontaneous detours.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Whether you travel solo or with family, Smart Travel Companion keeps
          each traveler informed and inspired.
        </Typography>
      </Stack>
      <Grid container spacing={3}>
        {testimonials.map((testimonial) => (
          <Grid item xs={12} md={6} key={testimonial.name}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(237,242,243,0.12)"
                      : "rgba(94,82,64,0.12)"
                  }`,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(15,26,34,0.95)"
                    : theme.palette.background.paper,
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 30px 80px -50px rgba(2,8,18,0.86)"
                    : theme.shadows[2],
              }}
            >
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {testimonial.quote}
                </Typography>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {testimonial.name} {testimonial.flag}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {testimonial.role}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

function FinalCTA() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        background:
          "linear-gradient(160deg, rgba(33,128,141,0.12) 0%, rgba(94,82,64,0.12) 100%)",
      }}
      className="landing-section-surface"
    >
      <Container maxWidth="md">
        <Card
          sx={{
            borderRadius: 4,
            textAlign: "center",
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(237,242,243,0.16)"
                  : "rgba(94,82,64,0.18)"
              }`,
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(14,26,33,0.95)"
                : "rgba(255,255,255,0.9)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 34px 90px -55px rgba(2,8,18,0.9)"
                : "0 30px 90px -55px rgba(12,32,44,0.45)",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              py: { xs: 5, md: 6 },
            }}
          >
            <Chip
              label="Ready when you are"
              color="primary"
              variant="outlined"
              sx={{ alignSelf: "center", fontWeight: 600 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Elevate every trip with a unified travel workspace.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 540, mx: "auto" }}
            >
              Join thousands of travelers who rely on Smart Travel Companion for
              smarter translation, curated planning, and real-time safety.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                size="large"
                variant="contained"
                onClick={() => (window.location.href = "/register")}
              >
                Create a free account
              </Button>
              <Button
                size="large"
                variant="outlined"
                onClick={() => (window.location.href = "/login")}
              >
                Log in
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

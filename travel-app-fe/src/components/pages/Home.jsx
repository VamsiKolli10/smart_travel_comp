import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import PageContainer from "../layout/PageContainer";
import Button from "../common/Button";
import { ModuleCard, ModuleCardGrid } from "../common/ModuleCard";
import { fetchProfile } from "../../services/user";
import { setUser } from "../../store/slices/authSlice";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const recentActivity = [
    { action: "Translated", text: "Where is the bathroom?", time: "2 min ago" },
    { action: "Saved phrase", text: "Thank you very much", time: "1 hour ago" },
    { action: "Viewed", text: "Museum of Fine Arts", time: "3 hours ago" },
  ];

  const dashboardCards = [
    {
      title: "Translate",
      description: "Quick two‑pane translator with history.",
      icon: "🌐",
      path: "/translation",
      color: "#21808d",
    },
    {
      title: "Phrasebook",
      description: "Curate and organize common phrases by category.",
      icon: "📚",
      path: "/phrasebook",
      color: "#4a9ba8",
    },
    {
      title: "Destinations",
      description: "Explore popular places, trails, and museums.",
      icon: "📍",
      path: "/destinations",
      color: "#7b1fa2",
    },
    {
      title: "Cultural Guide",
      description: "Learn greetings, etiquette, and local customs.",
      icon: "🏛️",
      path: "/cultural-guide",
      color: "#f57c00",
    },
    {
      title: "Stays",
      description: "Browse accommodations with ratings and amenities.",
      icon: "🏨",
      path: "/stays",
      color: "#388e3c",
    },
    {
      title: "Emergency",
      description: "Find local emergency contacts and tips.",
      icon: "🚨",
      path: "/emergency",
      color: "#d32f2f",
    },
  ];

  const quickActions = [
    {
      label: "Quick Translate",
      icon: "⚡",
      action: () => navigate("/translation"),
    },
    { label: "Emergency", icon: "🆘", action: () => navigate("/emergency") },
    {
      label: "Find Places",
      icon: "🔍",
      action: () => navigate("/destinations"),
    },
  ];

  useEffect(() => {
    fetchProfile().then((resp) => dispatch(setUser(resp)));
  }, [dispatch]);

  if (!user) return null;

  return (
    <PageContainer
      title={`Welcome back, ${user?.user?.name || "traveler"}`}
      subtitle="Stay on top of your trip with quick access to every tool."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Chip
            label="Boston, MA"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip label="Safe travels!" color="secondary" variant="outlined" />
        </Stack>
      }
    >
      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(33,128,141,0.08), rgba(94,82,64,0.08))",
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Quick Actions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Jump straight into the tools you use the most.
                </Typography>
              </Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1.5, sm: 1.5 }}
                sx={{
                  width: { xs: "100%", md: "auto" },
                  "& > *": { flexGrow: 1 },
                }}
              >
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="contained"
                    color="primary"
                    onClick={action.action}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <ModuleCardGrid>
          {dashboardCards.map((card) => (
            <ModuleCard
              key={card.title}
              interactive
              onClick={() => navigate(card.path)}
              sx={{
                backgroundColor: (theme) => theme.palette.background.paper,
                border: "1px solid rgba(94,82,64,0.12)",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  height: "100%",
                }}
              >
                <Chip
                  label={card.icon}
                  sx={{
                    alignSelf: "flex-start",
                    fontSize: 20,
                    px: 1.5,
                    py: 0.5,
                    backgroundColor: `${card.color}18`,
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "primary.main" }}
                >
                  Open →
                </Typography>
              </CardContent>
            </ModuleCard>
          ))}
        </ModuleCardGrid>

        <ModuleCardGrid
          sx={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
        >
          <ModuleCard
            sx={{
              border: "1px solid rgba(94,82,64,0.12)",
              backgroundColor: (theme) => theme.palette.background.paper,
            }}
          >
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Stack spacing={1.5}>
                {recentActivity.map((item) => (
                  <Stack
                    key={`${item.action}-${item.time}`}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "rgba(33,128,141,0.08)",
                    }}
                  >
                    <Box sx={{ fontSize: 24 }}>
                      {item.action === "Translated"
                        ? "🌐"
                        : item.action === "Saved phrase"
                        ? "💾"
                        : "👁️"}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.action}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        “{item.text}”
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.time}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </ModuleCard>

          <ModuleCard
            sx={{
              border: "1px solid rgba(94,82,64,0.12)",
              backgroundColor: (theme) => theme.palette.background.paper,
            }}
          >
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Travel Tips
              </Typography>
              <Stack spacing={1.5}>
                {[
                  {
                    icon: "💡",
                    text: "Save important phrases for offline access.",
                  },
                  {
                    icon: "📍",
                    text: "Share your location with trusted contacts.",
                  },
                  {
                    icon: "📱",
                    text: "Keep emergency contacts easily accessible.",
                  },
                ].map((tip) => (
                  <Stack
                    key={tip.text}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      border: "1px solid rgba(94,82,64,0.12)",
                      backgroundColor: "rgba(94,82,64,0.04)",
                    }}
                  >
                    <Box sx={{ fontSize: 24 }}>{tip.icon}</Box>
                    <Typography variant="body2">{tip.text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </ModuleCard>
        </ModuleCardGrid>
      </Stack>
    </PageContainer>
  );
}

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import PageContainer from "../layout/PageContainer";
import Button from "../common/Button";
import defaultEmergencyContacts from "../../data/emergencyContacts";
import useConnectivity from "../../hooks/useConnectivity";
import {
  cacheEmergencyContacts,
  readEmergencyContacts,
} from "../../services/offlineCache";

const emergencyTips = [
  {
    title: "Stay Calm",
    description: "Take a deep breath, assess the scene, and act decisively.",
    icon: "🧘",
  },
  {
    title: "Know Your Location",
    description: "Be ready to describe your address or nearby landmarks.",
    icon: "📍",
  },
  {
    title: "Share Your Plans",
    description: "Tell a trusted contact where you are and who you're with.",
    icon: "📱",
  },
  {
    title: "Keep Documents",
    description: "Carry IDs, insurance, and emergency contacts at all times.",
    icon: "📄",
  },
];

export default function Emergency() {
  const [activeCall, setActiveCall] = useState(null);
  const [contacts, setContacts] = useState(defaultEmergencyContacts);
  const [usingOfflineData, setUsingOfflineData] = useState(false);
  const [cacheUnavailable, setCacheUnavailable] = useState(false);
  const { isOnline } = useConnectivity();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (isOnline) {
        if (mounted) {
          setContacts(defaultEmergencyContacts);
          setUsingOfflineData(false);
          setCacheUnavailable(false);
        }
        await cacheEmergencyContacts(defaultEmergencyContacts);
        return;
      }
      const cached = await readEmergencyContacts();
      if (!mounted) return;
      if (cached?.length) {
        setContacts(cached);
        setUsingOfflineData(true);
        setCacheUnavailable(false);
      } else {
        setContacts(defaultEmergencyContacts);
        setUsingOfflineData(true);
        setCacheUnavailable(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOnline]);

  const handleCall = (contact) => {
    setActiveCall(contact.id);
    setTimeout(() => setActiveCall(null), 1200);
    window.open(`tel:${contact.number}`);
  };

  const handleCopy = async (number) => {
    try {
      await navigator.clipboard.writeText(number);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  return (
    <PageContainer
      title="Emergency"
      subtitle="Quick access to critical contacts, tips, and safety guidance."
      maxWidth="lg"
    >
      <Stack spacing={3}>
        <Alert
          severity="warning"
          icon={false}
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(255, 152, 0, 0.3)",
            background: "rgba(255, 152, 0, 0.12)",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            ⚠️ If you or someone near you is in immediate danger, call 911 right away.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share your location and stay on the line until help arrives.
          </Typography>
        </Alert>
        {usingOfflineData && (
          <Alert
            severity={cacheUnavailable ? "warning" : "info"}
            sx={{ borderRadius: 3 }}
          >
            {cacheUnavailable
              ? "You're offline and we couldn't find cached contacts. Showing built-in US contacts."
              : "You're offline. Showing the last synced emergency contacts so you still have the essentials."}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Emergency Preparedness
            </Typography>
            <Grid container spacing={2}>
              {emergencyTips.map((tip) => (
                <Grid item xs={12} sm={6} key={tip.title}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: "rgba(33,128,141,0.05)",
                    }}
                  >
                    <CardContent
                      sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Box sx={{ fontSize: 28, lineHeight: 1 }}>{tip.icon}</Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {tip.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tip.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Essential contacts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tap to call or copy a number for quick access.
                </Typography>
              </Box>
              <Chip label="US coverage" color="primary" variant="outlined" />
            </Stack>

            <Grid container spacing={2}>
              {contacts.map((contact) => (
                <Grid item xs={12} md={6} key={contact.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      borderColor:
                        activeCall === contact.id
                          ? "rgba(33,128,141,0.5)"
                          : "rgba(94,82,64,0.12)",
                    }}
                  >
                    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            backgroundColor: `${contact.color}20`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                          }}
                        >
                          {contact.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {contact.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {contact.description}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {contact.number}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PhoneIcon fontSize="small" />}
                          onClick={() => handleCall(contact)}
                          disabled={activeCall === contact.id}
                          sx={{ flexGrow: 1 }}
                        >
                          {activeCall === contact.id ? "Calling…" : "Call"}
                        </Button>
                        <Tooltip title="Copy number">
                          <IconButton
                            aria-label="Copy number"
                            onClick={() => handleCopy(contact.number)}
                            sx={{
                              borderRadius: 2,
                              border: "1px solid rgba(94,82,64,0.12)",
                            }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Stay prepared wherever you travel
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Save important numbers before you leave, and keep your phone charged
                  for emergencies.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => window.open("https://www.usa.gov/emergency-alerts", "_blank", "noopener,noreferrer")}
              >
                See safety guidance
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </PageContainer>
  );
}

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import PageContainer from "../layout/PageContainer";
import CulturalEtiquette from "./CulturalEtiquette";
import useTravelContext from "../../hooks/useTravelContext";

const featuredDestinations = [
  { destination: "Tokyo", culture: "Japanese", language: "ja" },
  { destination: "Paris", culture: "French", language: "fr" },
  { destination: "Mexico City", culture: "Mexican", language: "es" },
  { destination: "Cairo", culture: "Egyptian", language: "ar" },
];

/**
 * Cultural Guide landing experience.
 *
 * Reuses the unified Culture Intelligence stack so changes made to the backend
 * (culture briefs, Q&A, contextual tips) are surfaced immediately here.
 */
export default function CulturalGuide() {
  const {
    destination,
    culture,
    language,
    updateTravelContext,
    setDestinationContext,
  } = useTravelContext();

  useEffect(() => {
    if (!destination) {
      setDestinationContext(
        "Tokyo",
        { display: "Tokyo" },
        { source: "cultural-guide-default" }
      );
      updateTravelContext(
        { language: language || "en" },
        { source: "cultural-guide-default" }
      );
    }
  }, [destination, language, setDestinationContext, updateTravelContext]);

  const [destinationInput, setDestinationInput] = useState(
    destination || "Tokyo"
  );
  const [cultureInput, setCultureInput] = useState(culture || "");
  const [languageInput, setLanguageInput] = useState(language || "en");

  // Keep local inputs in sync when global context changes elsewhere
  useEffect(() => {
    if (destination !== undefined && destination !== destinationInput) {
      setDestinationInput(destination || "");
    }
  }, [destination]);

  useEffect(() => {
    if (culture !== undefined && culture !== cultureInput) {
      setCultureInput(culture || "");
    }
  }, [culture]);

  useEffect(() => {
    if (language !== undefined && language !== languageInput) {
      setLanguageInput(language || "en");
    }
  }, [language]);

  const handleApply = (event) => {
    event.preventDefault();
    const nextDestination = destinationInput.trim();
    if (!nextDestination) {
      return;
    }
    setDestinationContext(
      nextDestination,
      { display: nextDestination },
      { source: "cultural-guide" }
    );
    updateTravelContext(
      {
        culture: cultureInput.trim(),
        language: languageInput.trim() || "en",
        source: "cultural-guide",
      },
      { source: "cultural-guide" }
    );
  };

  return (
    <PageContainer
      title="Culture Intelligence"
      subtitle="Generate up-to-date etiquette briefs, safety norms, and coaching for any destination."
      maxWidth="lg"
    >
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={5}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <Card component="form" onSubmit={handleApply}>
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6">
                      Choose your destination
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update the fields below to pull the latest etiquette
                      brief, localized phrases, and safety tips from the Culture
                      Intelligence service.
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Destination"
                        placeholder="e.g., Lima"
                        value={destinationInput}
                        onChange={(e) => setDestinationInput(e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    {/* <Grid item xs={12} md={6}>
                      <TextField
                        label="Culture focus"
                        placeholder="optional"
                        value={cultureInput}
                        onChange={(e) => setCultureInput(e.target.value)}
                        fullWidth
                      />
                    </Grid> */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Language"
                        placeholder="ISO code (en, es, fr...)"
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        inputProps={{ maxLength: 10 }}
                        fullWidth
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      sx={{ display: "flex", alignItems: "stretch" }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={!destinationInput.trim()}
                      >
                        Load brief
                      </Button>
                    </Grid>
                  </Grid>

                  <Divider flexItem>Quick picks</Divider>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {featuredDestinations.map((item) => (
                      <Chip
                        key={item.destination}
                        label={`${
                          item.destination
                        } • ${item.language.toUpperCase()}`}
                        onClick={() => {
                          setDestinationInput(item.destination);
                          setCultureInput(item.culture);
                          setLanguageInput(item.language);
                          setDestinationContext(
                            item.destination,
                            { display: item.destination },
                            { source: "cultural-guide-quick-pick" }
                          );
                          updateTravelContext(
                            {
                              culture: item.culture,
                              language: item.language,
                            },
                            { source: "cultural-guide-quick-pick" }
                          );
                        }}
                        variant={
                          destination === item.destination &&
                          language === item.language
                            ? "filled"
                            : "outlined"
                        }
                        color={
                          destination === item.destination &&
                          language === item.language
                            ? "primary"
                            : "default"
                        }
                      />
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  What you’ll get
                </Typography>
                <Stack component="ul" spacing={1} sx={{ pl: 2, mb: 0 }}>
                  <Typography
                    component="li"
                    variant="body2"
                    color="text.secondary"
                  >
                    Fresh etiquette briefs cached for only 24 hours with manual
                    refresh control.
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    color="text.secondary"
                  >
                    Inline Culture Coach Q&A for nuanced scenarios and follow-up
                    questions.
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    color="text.secondary"
                  >
                    Optional language + culture focus to tailor phrasing and
                    emphasis.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        <Grid item xs={12} md={7}>
          <CulturalEtiquette
            destination={destination}
            culture={culture}
            language={language}
            sx={{ mt: 0 }}
          />
        </Grid>
      </Grid>
    </PageContainer>
  );
}

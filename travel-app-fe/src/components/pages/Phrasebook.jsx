import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Bookmark as BookmarkFilledIcon,
  BookmarkBorder as BookmarkIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import PageContainer from "../layout/PageContainer";
import Button from "../common/Button";
import { generatePhrasebook } from "../../services/phrasebook";
import {
  listSavedPhrases,
  addSavedPhrase,
  removeSavedPhrase,
} from "../../services/savedPhrases";
import useConnectivity from "../../hooks/useConnectivity";
import { cacheSavedPhrases, readSavedPhrases } from "../../services/offlineCache";

const COMMON_LANGS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Hindi",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Russian",
  "Turkish",
  "Thai",
  "Indonesian",
];

const COUNT_MARKS = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
  { value: 20, label: "20" },
  { value: 25, label: "25" },
];

export default function Phrasebook() {
  const [topic, setTopic] = useState("");
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [count, setCount] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [saved, setSaved] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const { isOnline } = useConnectivity();
  const [usingOfflineSaved, setUsingOfflineSaved] = useState(false);
  const [savedCacheMissing, setSavedCacheMissing] = useState(false);
  const persistSaved = (items) =>
    cacheSavedPhrases(items).catch((error) =>
      console.warn("Failed to persist saved phrases locally", error)
    );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingSaved(true);
        if (isOnline) {
          const items = await listSavedPhrases();
          if (!active) return;
          setSaved(items || []);
          setUsingOfflineSaved(false);
          setSavedCacheMissing(false);
          await cacheSavedPhrases(items || []);
          return;
        }
        const cached = await readSavedPhrases();
        if (!active) return;
        if (cached?.length) {
          setSaved(cached);
          setUsingOfflineSaved(true);
          setSavedCacheMissing(false);
        } else {
          setSaved([]);
          setUsingOfflineSaved(true);
          setSavedCacheMissing(true);
        }
      } catch (e) {
        const cached = await readSavedPhrases();
        if (active) {
          if (cached?.length) {
            setSaved(cached);
            setUsingOfflineSaved(true);
            setSavedCacheMissing(false);
          } else {
            setSaved([]);
            setSavedCacheMissing(true);
          }
        }
        console.warn(
          "Could not load saved phrases (likely low connectivity):",
          e?.response?.status || e?.message
        );
      } finally {
        if (active) setLoadingSaved(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isOnline]);

  const canSubmit =
    topic.trim() &&
    sourceLang.trim() &&
    targetLang.trim() &&
    sourceLang.trim().toLowerCase() !== targetLang.trim().toLowerCase();

  const savedKeys = useMemo(
    () =>
      new Set(
        saved.map(
          (item) => `${item.phrase?.toLowerCase()}::${item.targetLang?.toLowerCase()}`
        )
      ),
    [saved]
  );

  const currentTargetLang = (result && result.targetLang) || targetLang;

  const isSaved = (item) => {
    if (!item?.phrase || !currentTargetLang) return false;
    return savedKeys.has(
      `${item.phrase.toLowerCase()}::${(item.targetLang || currentTargetLang).toLowerCase()}`
    );
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    try {
      const data = await generatePhrasebook({
        topic,
        sourceLang,
        targetLang,
        count: Number(count) || 10,
      });
      setResult(data);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to generate phrasebook";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (item) => {
    if (!item?.phrase) return;
    const lang = item.targetLang || currentTargetLang;
    const existing = saved.find(
      (entry) =>
        entry.phrase?.toLowerCase() === item.phrase.toLowerCase() &&
        entry.targetLang?.toLowerCase() === lang?.toLowerCase()
    );

    if (existing) {
      try {
        await removeSavedPhrase(existing.id);
        setSaved((prev) => {
          const next = prev.filter((p) => p.id !== existing.id);
          persistSaved(next);
          return next;
        });
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message;
        setError(msg || "Failed to remove phrase");
      }
      return;
    }

    try {
      const id = await addSavedPhrase({
        phrase: item.phrase,
        transliteration: item.transliteration || "",
        meaning: item.meaning,
        usageExample: item.usageExample,
        topic: result?.topic || topic,
        sourceLang: result?.sourceLang || sourceLang,
        targetLang: lang,
      });
      setSaved((prev) => {
        const next = [
          {
            id,
            phrase: item.phrase,
            transliteration: item.transliteration || "",
            meaning: item.meaning,
            usageExample: item.usageExample,
            topic: result?.topic || topic,
            sourceLang: result?.sourceLang || sourceLang,
            targetLang: lang,
          },
          ...prev,
        ];
        persistSaved(next);
        return next;
      });
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.error || e?.message;
      if (status === 401) {
        setError("Please sign in to save phrases.");
      } else {
        setError(msg || "Failed to save phrase");
      }
    }
  };

  const removeSaved = async (id) => {
    try {
      await removeSavedPhrase(id);
      setSaved((prev) => {
        const next = prev.filter((p) => p.id !== id);
        persistSaved(next);
        return next;
      });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message;
      setError(msg || "Failed to remove saved phrase");
    }
  };

  return (
    <PageContainer
      title="Phrasebook"
      subtitle="Generate practical phrases, keep your favourites, and stay ready for any scenario."
      maxWidth="lg"
    >
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Box
              component="form"
              onSubmit={handleGenerate}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Topic"
                    placeholder="e.g. airport check-in, emergency, directions"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    freeSolo
                    options={COMMON_LANGS}
                    value={sourceLang}
                    onChange={(_, value) => setSourceLang(value || "")}
                    onInputChange={(_, value) => setSourceLang(value || "")}
                    renderInput={(params) => (
                      <TextField {...params} label="From language" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    freeSolo
                    options={COMMON_LANGS}
                    value={targetLang}
                    onChange={(_, value) => setTargetLang(value || "")}
                    onInputChange={(_, value) => setTargetLang(value || "")}
                    renderInput={(params) => (
                      <TextField {...params} label="To language" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Number of phrases
                    </Typography>
                    <Slider
                      value={count}
                      onChange={(_, value) =>
                        setCount(Array.isArray(value) ? value[0] : value)
                      }
                      step={1}
                      min={5}
                      max={25}
                      marks={COUNT_MARKS}
                      valueLabelDisplay="auto"
                    />
                  </Stack>
                </Grid>
              </Grid>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canSubmit || loading}
                >
                  {loading ? "Generating…" : "Generate"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleGenerate}
                  disabled={!canSubmit || loading}
                >
                  Refresh
                </Button>
                {!canSubmit && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: { xs: 1, sm: 0 } }}
                  >
                    Enter a topic, source language, and target language to get
                    started.
                  </Typography>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}
        {usingOfflineSaved && (
          <Alert
            severity={savedCacheMissing ? "warning" : "info"}
            sx={{ borderRadius: 2 }}
          >
            {savedCacheMissing
              ? "You're offline and we don't have any saved phrases cached yet."
              : "You're offline. Showing your last synced saved phrases. Changes will sync once you're back online."}
          </Alert>
        )}

        {loading && (
          <Card>
            <CardContent sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </CardContent>
          </Card>
        )}

        {result?.phrases?.length ? (
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {result.topic}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.sourceLang} → {result.targetLang} • {result.phrases.length}{" "}
                  phrases
                </Typography>
              </Box>
              <Chip
                label="Newly generated"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            <Grid container spacing={2}>
              {result.phrases.map((item, index) => {
                const savedAlready = isSaved(item);
                return (
                  <Grid item xs={12} md={6} key={`${item.phrase}-${index}`}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        borderColor: savedAlready
                          ? "rgba(33,128,141,0.4)"
                          : "rgba(94,82,64,0.12)",
                      }}
                    >
                      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Stack spacing={0.5}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              sx={{ fontWeight: 600 }}
                            >
                              #{index + 1}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {item.phrase}
                            </Typography>
                          </Stack>
                          <IconButton
                            aria-label={savedAlready ? "Remove from saved" : "Save phrase"}
                            onClick={() => toggleSave(item)}
                            color={savedAlready ? "primary" : "default"}
                            size="small"
                          >
                            {savedAlready ? <BookmarkFilledIcon /> : <BookmarkIcon />}
                          </IconButton>
                        </Stack>

                        {item.transliteration && (
                          <Typography variant="body2" color="text.secondary">
                            {item.transliteration}
                          </Typography>
                        )}
                        {item.meaning && (
                          <Typography variant="body1">{item.meaning}</Typography>
                        )}
                        {item.usageExample && (
                          <Typography variant="body2" color="text.secondary">
                            “{item.usageExample}”
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
        ) : (
          !loading && (
            <Card>
              <CardContent
                sx={{
                  textAlign: "center",
                  py: 6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Generate a phrasebook to get started
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a topic and language pair, then let us create contextual phrases
                  you can review and keep handy.
                </Typography>
              </CardContent>
            </Card>
          )
        )}

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
                  Saved phrases
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Easily revisit the phrases you rely on the most.
                </Typography>
              </Box>
              <Chip
                label={
                  loadingSaved ? "Loading…" : `${saved.length} saved`
                }
                color="secondary"
                variant="outlined"
              />
            </Stack>

            {loadingSaved ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : saved.length ? (
              <Grid container spacing={2}>
                {saved.map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Card
                      variant="outlined"
                      sx={{ borderRadius: 3, height: "100%" }}
                    >
                      <CardContent
                        sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {item.phrase}
                          </Typography>
                          <IconButton
                            aria-label="Remove saved phrase"
                            onClick={() => removeSaved(item.id)}
                            size="small"
                          >
                            <BookmarkFilledIcon color="primary" fontSize="small" />
                          </IconButton>
                        </Stack>
                        {item.transliteration && (
                          <Typography variant="body2" color="text.secondary">
                            {item.transliteration}
                          </Typography>
                        )}
                        {item.meaning && (
                          <Typography variant="body1">{item.meaning}</Typography>
                        )}
                        {item.usageExample && (
                          <Typography variant="body2" color="text.secondary">
                            “{item.usageExample}”
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1}>
                          {item.topic && <Chip label={item.topic} size="small" />}
                          <Chip
                            label={`${item.sourceLang} → ${item.targetLang}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 5,
                  px: { xs: 2, md: 4 },
                  backgroundColor: "rgba(33,128,141,0.06)",
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  No saved phrases yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate a phrasebook and tap the bookmark icon to keep phrases handy.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>
    </PageContainer>
  );
}

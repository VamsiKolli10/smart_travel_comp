import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  SwapHoriz as SwapIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as SpeakerIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import Button from "../common/Button";
import PageContainer from "../layout/PageContainer";
import { ModuleCard, ModuleCardGrid } from "../common/ModuleCard";
import { translateText } from "../../services/translation";
import { useAnalytics } from "../../contexts/AnalyticsContext.jsx";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

const translationHighlights = [
  {
    title: "Context-aware output",
    description:
      "We preserve tone and idioms, so your translations feel natural and confident.",
    icon: "🧭",
  },
  {
    title: "Offline ready",
    description:
      "Capture phrases and play them back even when you are away from a network.",
    icon: "📶",
  },
  {
    title: "One-tap sharing",
    description:
      "Copy, speak, or save translations into your phrasebook without leaving the page.",
    icon: "⚡",
  },
];

const quickTips = [
  "Hold the mic button to capture short phrases hands-free.",
  "Use the speech sliders to match local cadence before playback.",
  "Save your go-to phrases so they sync to the Phrasebook tab.",
];

export default function Translation() {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [filteredVoices, setFilteredVoices] = useState([]);
  const [browserSupport, setBrowserSupport] = useState({
    recognition: false,
    synthesis: false,
  });

  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const { trackModuleView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackModuleView("translation");
  }, [trackModuleView]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = sourceLang;
      setBrowserSupport((prev) => ({ ...prev, recognition: true }));

      recognitionRef.current.onstart = () => setIsRecording(true);
      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = (event) =>
        console.error("Speech recognition error:", event.error);
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += transcript + " ";
          else interimTranscript += transcript;
        }

        setSource(finalTranscript || interimTranscript);
      };
    }

    if ("speechSynthesis" in window) {
      setBrowserSupport((prev) => ({ ...prev, synthesis: true }));
      utteranceRef.current = new SpeechSynthesisUtterance();

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        const matches = voices.filter((voice) =>
          voice.lang.toLowerCase().includes(targetLang)
        );
        setFilteredVoices(matches);
        if (matches.length && !selectedVoice) setSelectedVoice(matches[0]);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      utteranceRef.current.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utteranceRef.current.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
    }

    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.abort();
    };
  }, [selectedVoice, targetLang]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = sourceLang;
    }
  }, [sourceLang]);

  useEffect(() => {
    const matches = availableVoices.filter((voice) =>
      voice.lang.toLowerCase().includes(targetLang)
    );
    setFilteredVoices(matches);
    if (matches.length) setSelectedVoice(matches[0]);
  }, [availableVoices, targetLang]);

  const handleStartRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setSource("");
      recognitionRef.current.start();
    }
  };

  const handleStopRecording = () => {
    recognitionRef.current?.stop();
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSource(target);
    setTarget(source);
  };

  const handleTranslate = async () => {
    if (!source.trim()) return;
    if (sourceLang === targetLang) {
      setTarget(source);
      trackEvent("translation_submit", {
        sourceLang,
        targetLang,
        identicalLanguages: true,
        characters: source.length,
        success: true,
      });
      return;
    }
    setLoading(true);
    setTarget("");

    try {
      const data = await translateText(source, `${sourceLang}-${targetLang}`);
      setTarget(data?.translation || "Translation failed.");
      trackEvent("translation_submit", {
        sourceLang,
        targetLang,
        characters: source.length,
        success: Boolean(data?.translation),
      });
    } catch (error) {
      console.error("Translation error:", error);
      setTarget("Error contacting translation server.");
      trackEvent("translation_submit", {
        sourceLang,
        targetLang,
        characters: source.length,
        success: false,
        error: error?.message || "unknown",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (text, lang) => {
    if (!browserSupport.synthesis || !text) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    utteranceRef.current.text = text;
    utteranceRef.current.lang = lang;
    utteranceRef.current.rate = speechRate;
    utteranceRef.current.pitch = speechPitch;
    if (selectedVoice) utteranceRef.current.voice = selectedVoice;
    synth.speak(utteranceRef.current);
  };

  const handlePauseAudio = () => {
    if (!browserSupport.synthesis) return;
    const synth = window.speechSynthesis;
    if (isSpeaking && !isPaused) {
      synth.pause();
      setIsPaused(true);
    } else if (isPaused) {
      synth.resume();
      setIsPaused(false);
    }
  };

  const handleStopAudio = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const supportChips = useMemo(
    () => (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip
          label={
            browserSupport.recognition
              ? "Voice input ready"
              : "Voice input unavailable"
          }
          color={browserSupport.recognition ? "primary" : "warning"}
          variant={browserSupport.recognition ? "filled" : "outlined"}
        />
        <Chip
          label={
            browserSupport.synthesis
              ? "Speech output ready"
              : "Speech output unavailable"
          }
          color={browserSupport.synthesis ? "primary" : "warning"}
          variant={browserSupport.synthesis ? "filled" : "outlined"}
        />
      </Stack>
    ),
    [browserSupport.recognition, browserSupport.synthesis]
  );

  return (
    <PageContainer
      eyebrow="Live translator"
      title="Translation"
      subtitle="Bridge languages in real time with voice input, speech playback, and smart controls."
      maxWidth="xl"
      gap={4}
      actions={supportChips}
    >
      <Stack spacing={4}>
        {(!browserSupport.recognition || !browserSupport.synthesis) && (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            Some voice features may not be supported in this browser. You can
            still type to translate.
          </Alert>
        )}

        <Card
          sx={{
            borderRadius: 4,
            border: "1px solid rgba(94,82,64,0.18)",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
          }}
        >
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              flexWrap="wrap"
            >
              <Chip label="Workspace" color="primary" variant="outlined" />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`From: ${sourceLang.toUpperCase()}`} />
                <Chip label={`To: ${targetLang.toUpperCase()}`} />
              </Stack>
            </Stack>
            <Divider />
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              flexWrap="wrap"
            >
              <FormControl sx={{ minWidth: { xs: "100%", sm: 160 } }}>
                <InputLabel>From</InputLabel>
                <Select
                  value={sourceLang}
                  label="From"
                  onChange={(e) => setSourceLang(e.target.value)}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title="Swap languages and text">
                <IconButton
                  onClick={handleSwap}
                  sx={{
                    border: "1px solid rgba(94,82,64,0.16)",
                    borderRadius: 2,
                    backgroundColor: "background.default",
                  }}
                >
                  <SwapIcon />
                </IconButton>
              </Tooltip>

              <FormControl sx={{ minWidth: { xs: "100%", sm: 160 } }}>
                <InputLabel>To</InputLabel>
                <Select
                  value={targetLang}
                  label="To"
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Grid container spacing={2.5} alignItems="stretch">
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    backgroundColor: "background.paper",
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                          ? "0 8px 16px rgba(0,0,0,0.3)"
                          : "0 8px 16px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        Input
                      </Typography>
                      {browserSupport.recognition && (
                        <Tooltip
                          title={
                            isRecording ? "Stop recording" : "Start recording"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={
                              isRecording
                                ? handleStopRecording
                                : handleStartRecording
                            }
                            color={isRecording ? "error" : "primary"}
                            sx={{
                              animation: isRecording
                                ? "pulse 1.5s infinite"
                                : "none",
                              "@keyframes pulse": {
                                "0%": { transform: "scale(1)" },
                                "50%": { transform: "scale(1.1)" },
                                "100%": { transform: "scale(1)" },
                              },
                            }}
                          >
                            {isRecording ? <MicOffIcon /> : <MicIcon />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      minRows={7}
                      maxRows={12}
                      placeholder={
                        browserSupport.recognition
                          ? "Type or use the microphone to capture speech…"
                          : "Type text to translate…"
                      }
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(0,0,0,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.3)"
                                : "rgba(0,0,0,0.3)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "primary.main",
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                    {isRecording && (
                      <Alert
                        severity="info"
                        icon={<MicIcon fontSize="small" />}
                        sx={{
                          borderRadius: 2,
                          py: 0.5,
                          animation: "fadeIn 0.3s ease-in-out",
                          "@keyframes fadeIn": {
                            "0%": {
                              opacity: 0,
                              transform: "translateY(-10px)",
                            },
                            "100%": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        Listening... Speak now
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    backgroundColor: "background.paper",
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                          ? "0 8px 16px rgba(0,0,0,0.3)"
                          : "0 8px 16px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        Output
                      </Typography>
                      {browserSupport.synthesis && target && (
                        <Stack direction="row" spacing={1}>
                          <Tooltip
                            title={isSpeaking && !isPaused ? "Stop" : "Play"}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                isSpeaking
                                  ? handleStopAudio()
                                  : handlePlayAudio(target, targetLang)
                              }
                              color="primary"
                            >
                              {isSpeaking && !isPaused ? (
                                <StopIcon />
                              ) : (
                                <PlayIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                          {isSpeaking && (
                            <Tooltip title={isPaused ? "Resume" : "Pause"}>
                              <IconButton
                                size="small"
                                onClick={handlePauseAudio}
                                color="primary"
                                sx={{
                                  animation: isPaused
                                    ? "none"
                                    : "pulse 1.5s infinite",
                                  "@keyframes pulse": {
                                    "0%": { transform: "scale(1)" },
                                    "50%": { transform: "scale(1.1)" },
                                    "100%": { transform: "scale(1)" },
                                  },
                                }}
                              >
                                {isPaused ? <PlayIcon /> : <PauseIcon />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      )}
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      minRows={7}
                      maxRows={12}
                      value={target}
                      placeholder="Translated text will appear here…"
                      InputProps={{
                        readOnly: true,
                        endAdornment: loading ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : undefined,
                        sx: {
                          "&.Mui-readOnly": {
                            backgroundColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.03)",
                          },
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(0,0,0,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.3)"
                                : "rgba(0,0,0,0.3)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "primary.main",
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                    {loading && (
                      <Alert
                        severity="info"
                        icon={<CircularProgress size={16} />}
                        sx={{
                          borderRadius: 2,
                          py: 0.5,
                          animation: "fadeIn 0.3s ease-in-out",
                          "@keyframes fadeIn": {
                            "0%": {
                              opacity: 0,
                              transform: "translateY(-10px)",
                            },
                            "100%": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        Translating text...
                      </Alert>
                    )}
                    {target && !loading && (
                      <Alert
                        severity="success"
                        icon={<SpeakerIcon fontSize="small" />}
                        sx={{
                          borderRadius: 2,
                          py: 0.5,
                          animation: "fadeIn 0.3s ease-in-out",
                          "@keyframes fadeIn": {
                            "0%": {
                              opacity: 0,
                              transform: "translateY(-10px)",
                            },
                            "100%": { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        Translation complete
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent={{ xs: "stretch", sm: "flex-end" }}
              flexWrap="wrap"
              sx={{ mt: 1 }}
            >
              <Button
                onClick={handleTranslate}
                variant="contained"
                disabled={loading || !source.trim()}
                size="large"
                sx={{
                  minWidth: 120,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                  "&:disabled": {
                    opacity: 0.6,
                  },
                }}
              >
                {loading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} color="inherit" />
                    <span>Translating…</span>
                  </Stack>
                ) : (
                  "Translate"
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={() => target && navigator.clipboard.writeText(target)}
                disabled={!target}
                size="large"
                sx={{
                  minWidth: 100,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 2,
                  },
                }}
              >
                Copy
              </Button>
              <Button
                variant="outlined"
                onClick={() => handlePlayAudio(target, targetLang)}
                disabled={!target || !browserSupport.synthesis}
                startIcon={<SpeakerIcon />}
                size="large"
                sx={{
                  minWidth: 100,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 2,
                  },
                }}
              >
                Speak
              </Button>
              <Button
                variant="outlined"
                onClick={() => alert("Save to Phrasebook not implemented yet")}
                disabled={!target}
                size="large"
                sx={{
                  minWidth: 150,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 2,
                  },
                }}
              >
                Save to Phrasebook
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={browserSupport.synthesis ? 7 : 6}>
            {browserSupport.synthesis && (
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
                      ? "rgba(13,24,32,0.95)"
                      : "rgba(255,255,255,0.92)",
                  transition:
                    "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 12px 20px rgba(0,0,0,0.4)"
                        : "0 12px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Speech settings
                    </Typography>
                    <Chip
                      label="Playback"
                      color="primary"
                      variant="outlined"
                      sx={{
                        animation: isSpeaking ? "pulse 1.5s infinite" : "none",
                        "@keyframes pulse": {
                          "0%": { transform: "scale(1)" },
                          "50%": { transform: "scale(1.05)" },
                          "100%": { transform: "scale(1)" },
                        },
                      }}
                    />
                  </Stack>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.2)"
                                  : "rgba(0,0,0,0.2)",
                            },
                            "&:hover fieldset": {
                              borderColor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.3)"
                                  : "rgba(0,0,0,0.3)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "primary.main",
                              borderWidth: 2,
                            },
                          },
                        }}
                      >
                        <InputLabel>Voice</InputLabel>
                        <Select
                          value={selectedVoice?.name || ""}
                          label="Voice"
                          onChange={(e) => {
                            const voice = availableVoices.find(
                              (v) => v.name === e.target.value
                            );
                            setSelectedVoice(voice);
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                "& .MuiMenuItem-root": {
                                  "&.Mui-selected": {
                                    backgroundColor: "primary.light",
                                    color: "primary.contrastText",
                                  },
                                  "&:hover": {
                                    backgroundColor: "action.hover",
                                  },
                                },
                              },
                            },
                          }}
                        >
                          {filteredVoices.map((voice) => (
                            <MenuItem key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, fontWeight: 500 }}
                        >
                          Speech rate: {speechRate.toFixed(1)}
                        </Typography>
                        <Slider
                          value={speechRate}
                          onChange={(_, value) => setSpeechRate(value)}
                          min={0.5}
                          max={2}
                          step={0.1}
                          marks={[
                            { value: 0.5, label: "0.5x" },
                            { value: 1, label: "1x" },
                            { value: 1.5, label: "1.5x" },
                            { value: 2, label: "2x" },
                          ]}
                          sx={{
                            "& .MuiSlider-mark": {
                              backgroundColor: "primary.main",
                              height: 8,
                              width: 8,
                              borderRadius: "50%",
                            },
                            "& .MuiSlider-markLabel": {
                              fontSize: "0.75rem",
                            },
                            "& .MuiSlider-thumb": {
                              transition: "transform 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.2)",
                              },
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, fontWeight: 500 }}
                        >
                          Pitch: {speechPitch.toFixed(1)}
                        </Typography>
                        <Slider
                          value={speechPitch}
                          onChange={(_, value) => setSpeechPitch(value)}
                          min={0.5}
                          max={2}
                          step={0.1}
                          marks={[
                            { value: 0.5, label: "Low" },
                            { value: 1, label: "Normal" },
                            { value: 1.5, label: "High" },
                            { value: 2, label: "Very high" },
                          ]}
                          sx={{
                            "& .MuiSlider-mark": {
                              backgroundColor: "primary.main",
                              height: 8,
                              width: 8,
                              borderRadius: "50%",
                            },
                            "& .MuiSlider-markLabel": {
                              fontSize: "0.75rem",
                            },
                            "& .MuiSlider-thumb": {
                              transition: "transform 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.2)",
                              },
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            mb: 1,
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          Volume
                          <Chip
                            label="Fixed"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Typography>
                        <Slider
                          value={100}
                          min={0}
                          max={100}
                          disabled
                          marks
                          sx={{
                            "& .MuiSlider-mark": {
                              backgroundColor: "secondary.main",
                              height: 8,
                              width: 8,
                              borderRadius: "50%",
                            },
                            "& .MuiSlider-markLabel": {
                              fontSize: "0.75rem",
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ mt: 1 }}
                  >
                    <Button
                      variant="contained"
                      onClick={() =>
                        handlePlayAudio(target || "Sample phrase", targetLang)
                      }
                      disabled={!target}
                      startIcon={<SpeakerIcon />}
                      fullWidth
                      sx={{
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 4,
                        },
                      }}
                    >
                      Test voice
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handlePauseAudio}
                      disabled={!isSpeaking}
                      sx={{
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 2,
                        },
                      }}
                    >
                      {isPaused ? "Resume" : "Pause"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleStopAudio}
                      disabled={!isSpeaking}
                      sx={{
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 2,
                        },
                      }}
                    >
                      Stop
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} lg={browserSupport.synthesis ? 5 : 12}>
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
                    : "rgba(255,255,255,0.92)",
              }}
            >
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Quick tips
                  </Typography>
                  <Chip label="Best practice" size="small" />
                </Stack>
                <Stack spacing={1.5}>
                  {quickTips.map((tip) => (
                    <Stack
                      key={tip}
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Typography variant="body2" color="primary">
                        ●
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tip}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <ModuleCardGrid>
          {translationHighlights.map((highlight) => (
            <ModuleCard
              key={highlight.title}
              sx={{
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(237,242,243,0.14)"
                      : "rgba(94,82,64,0.12)"
                  }`,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(14,26,33,0.95)"
                    : "rgba(255,255,255,0.9)",
              }}
            >
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
              >
                <Typography variant="h4" component="span">
                  {highlight.icon}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {highlight.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {highlight.description}
                </Typography>
              </CardContent>
            </ModuleCard>
          ))}
        </ModuleCardGrid>
      </Stack>
    </PageContainer>
  );
}

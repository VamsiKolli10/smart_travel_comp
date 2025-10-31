import { useState, useEffect, useRef } from "react";
import {
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Box,
  CircularProgress,
  Slider,
  Tooltip,
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

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Initialize Web Speech APIs
  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = sourceLang;
      setBrowserSupport((prev) => ({ ...prev, recognition: true }));

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setSource(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
    }

    // Check Text-to-Speech support
    if ("speechSynthesis" in window) {
      setBrowserSupport((prev) => ({ ...prev, synthesis: true }));
      utteranceRef.current = new SpeechSynthesisUtterance();

      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        let tempFilter = voices?.filter((voice) =>
          voice?.lang.includes(targetLang)
        );
        setFilteredVoices([...tempFilter]);
        if (tempFilter.length > 0 && !selectedVoice) {
          setSelectedVoice(tempFilter[0]);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      utteranceRef.current.onstart = () => setIsSpeaking(true);
      utteranceRef.current.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update recognition language when source language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = sourceLang;
    }
  }, [sourceLang]);

  useEffect(() => {
    let tempFilter = availableVoices?.filter((voice) =>
      voice.lang.includes(targetLang)
    );
    console.log(tempFilter);
    setFilteredVoices([...tempFilter]);
    setSelectedVoice(tempFilter[0]);
  }, [targetLang]);

  const handleStartRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setSource(""); // Clear previous transcript
      recognitionRef.current.start();
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const handleSwap = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

    const tempText = source;
    setSource(target);
    setTarget(tempText);

    if (recognitionRef.current) {
      recognitionRef.current.lang = targetLang;
    }
  };

  const handleTranslate = async () => {
    if (!source.trim()) return;
    if (sourceLang === targetLang) {
      setTarget(source);
      return;
    }
    setLoading(true);
    setTarget("");

    try {
      const res = await fetch("http://localhost:8000/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: source,
          langPair: `${sourceLang}-${targetLang}`,
        }),
      });
      const data = await res.json();
      if (data?.translation) {
        setTarget(data.translation);
      } else {
        setTarget("Translation failed.");
      }
    } catch (err) {
      console.error("Translation error:", err);
      setTarget("Error contacting translation server.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (text, lang) => {
    if (!browserSupport.synthesis) return;

    const synth = window.speechSynthesis;
    synth.cancel(); // Stop any ongoing speech

    utteranceRef.current.text = text;
    utteranceRef.current.lang = lang;
    utteranceRef.current.rate = speechRate;
    utteranceRef.current.pitch = speechPitch;
    utteranceRef.current.volume = 1;

    if (selectedVoice) {
      utteranceRef.current.voice = selectedVoice;
    }

    setIsPaused(false);
    synth.speak(utteranceRef.current);
  };

  const handlePauseAudio = () => {
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
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <Grid
      container
      flexDirection={"column"}
      sx={{ maxWidth: 900, margin: "0 auto", padding: { xs: 1, sm: 2 } }}
    >
      <Grid item sx={{ textAlign: "center", marginBottom: 4 }}>
        <Typography variant="h1">Translation</Typography>
        {(!browserSupport.recognition || !browserSupport.synthesis) && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            ⚠️ Some voice features may not be supported in your browser
          </Typography>
        )}
      </Grid>

      {/* Language selectors */}
      <Grid
        item
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1, sm: 2 },
          marginBottom: 3,
          flexWrap: "wrap",
        }}
      >
        <FormControl sx={{ minWidth: { xs: 100, sm: 120 } }}>
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
              backgroundColor: theme.palette.action.hover,
              "&:hover": {
                backgroundColor: theme.palette.action.selected,
              },
            }}
          >
            <SwapIcon />
          </IconButton>
        </Tooltip>

        <FormControl sx={{ minWidth: { xs: 100, sm: 120 } }}>
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
      </Grid>

      {/* Speech Controls */}
      {browserSupport.synthesis && (
        <Grid
          item
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            padding: 2,
            marginBottom: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ marginBottom: 2 }}>
            Speech Settings
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
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
                >
                  {filteredVoices
                    ?.filter(
                      (voice) =>
                        voice.lang.startsWith(targetLang.split("-")[0]) ||
                        voice.lang.startsWith("en")
                    )
                    .map((voice) => (
                      <MenuItem key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2">
                  Speech Rate: {speechRate.toFixed(1)}
                </Typography>
                <Slider
                  value={speechRate}
                  onChange={(e, newValue) => setSpeechRate(newValue)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  marks
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2">
                  Pitch: {speechPitch.toFixed(1)}
                </Typography>
                <Slider
                  value={speechPitch}
                  onChange={(e, newValue) => setSpeechPitch(newValue)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  marks
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Input + Output fields */}
      <Grid
        container
        justifyContent={"center"}
        spacing={{ xs: 2, sm: 3 }}
        sx={{ marginBottom: 3 }}
      >
        <Grid item xs={12} md={6} flexGrow={1}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="subtitle2">Input Text</Typography>
                {browserSupport.recognition && (
                  <Tooltip
                    title={isRecording ? "Stop recording" : "Start recording"}
                  >
                    <IconButton
                      size="small"
                      onClick={
                        isRecording ? handleStopRecording : handleStartRecording
                      }
                      color={isRecording ? "error" : "primary"}
                    >
                      {isRecording ? <MicOffIcon /> : <MicIcon />}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder={
                  browserSupport.recognition
                    ? "Type text or click mic to speak..."
                    : "Type text..."
                }
                value={source}
                onChange={(e) => setSource(e.target.value)}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} flexGrow={1}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="subtitle2">Translated Text</Typography>
                {browserSupport.synthesis && target && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title={isSpeaking ? "Stop" : "Play"}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          isSpeaking
                            ? handleStopAudio()
                            : handlePlayAudio(target, targetLang)
                        }
                        color="primary"
                      >
                        {isSpeaking && !isPaused ? <StopIcon /> : <PlayIcon />}
                      </IconButton>
                    </Tooltip>
                    {isSpeaking && (
                      <Tooltip title={isPaused ? "Resume" : "Pause"}>
                        <IconButton
                          size="small"
                          onClick={handlePauseAudio}
                          color="primary"
                        >
                          {isPaused ? <PlayIcon /> : <PauseIcon />}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </Box>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Translated text will appear here..."
                value={target}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
              {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action buttons */}
      <Grid
        item
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 2 },
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <Button
          onClick={handleTranslate}
          variant="contained"
          disabled={loading || !source.trim()}
        >
          {loading ? "Translating…" : "Translate"}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigator.clipboard.writeText(target)}
          disabled={!target}
        >
          Copy
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            if (browserSupport.synthesis && target) {
              handlePlayAudio(target, targetLang);
            }
          }}
          disabled={!target || !browserSupport.synthesis}
          startIcon={<SpeakerIcon />}
        >
          Speak
        </Button>
        <Button
          variant="outlined"
          onClick={() => alert("Save to Phrasebook not implemented yet")}
          disabled={!target}
        >
          Save to Phrasebook
        </Button>
      </Grid>
    </Grid>
  );
}

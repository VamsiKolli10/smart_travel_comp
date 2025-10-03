import { useState } from "react";
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
} from "@mui/material";
import { SwapHoriz as SwapIcon } from "@mui/icons-material";
import Button from "../common/Button";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  // { value: "hi", label: "Hindi" },   // ❌ not supported by MarianMT yet
  // { value: "zh", label: "Chinese" }, // ❌ not supported by MarianMT yet
];

export default function Translation() {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleSwap = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

    const tempText = source;
    setSource(target);
    setTarget(tempText);
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

  return (
    <Grid
      container
      flexDirection={"column"}
      sx={{ maxWidth: 800, margin: "0 auto", padding: { xs: 1, sm: 2 } }}
    >
      <Grid item sx={{ textAlign: "center", marginBottom: 4 }}>
        <Typography variant="h1">Translator</Typography>
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
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Type text..."
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
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Translated text..."
                value={target}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
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
          justifyContent: "right",
          flexWrap: "wrap",
        }}
      >
        <Button onClick={handleTranslate} variant="contained" disabled={loading}>
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
          onClick={() => alert("Save to Phrasebook not implemented yet")}
          disabled={!target}
        >
          Save to Phrasebook
        </Button>
      </Grid>
    </Grid>
  );
}

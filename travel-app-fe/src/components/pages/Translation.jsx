import { useState } from "react";
import {
  Typography,
  Box,
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
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
];

export default function Translation() {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");

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

  const handleTranslate = () => {
    // Demo translation - reverse the text
    setTarget(source.split("").reverse().join(""));
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

      <Grid
        item
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 2 },
          justifyContent: "right",
          flexWrap: "wrap",
        }}
      >
        <Button onClick={handleTranslate} variant="contained">
          Translate (demo)
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigator.clipboard.writeText(target)}
        >
          Copy
        </Button>
        <Button variant="outlined">Save to Phrasebook</Button>
      </Grid>
    </Grid>
  );
}

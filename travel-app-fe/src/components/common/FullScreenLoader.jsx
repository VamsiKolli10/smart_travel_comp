import PropTypes from "prop-types";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function FullScreenLoader({ message = "Preparing your experience…" }) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        px: 2,
      }}
    >
      <CircularProgress color="primary" size={36} />
      <Typography variant="body2" color="text.secondary" align="center">
        {message}
      </Typography>
    </Box>
  );
}

FullScreenLoader.propTypes = {
  message: PropTypes.string,
};

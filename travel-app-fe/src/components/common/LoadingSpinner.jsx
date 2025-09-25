import { CircularProgress, Box } from "@mui/material";

export default function LoadingSpinner({ size = 20, ...props }) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={4}>
      <CircularProgress size={size} {...props} />
    </Box>
  );
}

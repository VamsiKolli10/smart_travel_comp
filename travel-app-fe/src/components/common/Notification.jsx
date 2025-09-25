import { Snackbar, Alert } from "@mui/material";

export default function Notification({
  message,
  type = "info",
  show = false,
  onClose,
}) {
  const severity =
    type === "error"
      ? "error"
      : type === "warning"
      ? "warning"
      : type === "success"
      ? "success"
      : "info";

  return (
    <Snackbar
      open={show}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

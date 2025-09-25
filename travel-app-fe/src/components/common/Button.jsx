import { Button as MuiButton } from "@mui/material";

export default function Button({
  variant = "contained",
  size = "medium",
  fullWidth = false,
  children,
  ...props
}) {
  return (
    <MuiButton
      variant={
        variant === "primary"
          ? "contained"
          : variant === "secondary"
          ? "contained"
          : "outlined"
      }
      size={size === "sm" ? "small" : size === "lg" ? "large" : "medium"}
      fullWidth={fullWidth}
      {...props}
    >
      {children}
    </MuiButton>
  );
}

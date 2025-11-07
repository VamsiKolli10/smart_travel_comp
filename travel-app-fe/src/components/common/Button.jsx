import { Button as MuiButton } from "@mui/material";

export default function Button({
  variant = "contained",
  size = "medium",
  fullWidth = false,
  color,
  children,
  ...props
}) {
  const resolvedVariant =
    variant === "primary" || variant === "secondary" ? "contained" : variant;
  const resolvedColor =
    variant === "primary"
      ? "primary"
      : variant === "secondary"
      ? "secondary"
      : color ?? "primary";
  const resolvedSize =
    size === "sm" || size === "small"
      ? "small"
      : size === "lg" || size === "large"
      ? "large"
      : "medium";

  return (
    <MuiButton
      variant={resolvedVariant}
      size={resolvedSize}
      fullWidth={fullWidth}
      color={resolvedColor}
      {...props}
    >
      {children}
    </MuiButton>
  );
}

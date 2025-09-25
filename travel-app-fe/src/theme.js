import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#21808D", // teal-500
      light: "#32B8C6", // teal-300
      dark: "#1D7480", // teal-700
      contrastText: "#FCFCF9", // cream-50
    },
    secondary: {
      main: "#5E5240", // brown-600
      light: "#A7A9A9", // gray-300
      dark: "#1F2121", // charcoal-700
      contrastText: "#FCFCF9",
    },
    background: {
      default: "#FCFCF9", // cream-50
      paper: "#FFFFFD", // cream-100
    },
    text: {
      primary: "#13343B", // slate-900
      secondary: "#626C71", // slate-500
    },
    error: {
      main: "#C0152F", // red-500
      light: "#FF5459", // red-400
    },
    warning: {
      main: "#A84B2F", // orange-500
      light: "#E68161", // orange-400
    },
    success: {
      main: "#21808D", // teal-500
      light: "#32B8C6", // teal-300
    },
    info: {
      main: "#626C71", // slate-500
    },
  },
  typography: {
    fontFamily:
      '"FKGroteskNeue", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"FKGroteskNeue", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
          padding: "8px 16px",
          transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: '"FKGroteskNeue", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        contained: {
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          "&:hover": {
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
          },
        },
        outlined: {
          borderColor: "rgba(94, 82, 64, 0.2)",
          "&:hover": {
            backgroundColor: "rgba(94, 82, 64, 0.12)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid rgba(94, 82, 64, 0.12)",
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          transition: "box-shadow 250ms cubic-bezier(0.16, 1, 0.3, 1)",
          "&:hover": {
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(94, 82, 64, 0.2)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#21808D",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFD",
          borderBottom: "1px solid rgba(94, 82, 64, 0.12)",
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFD",
          borderTop: "1px solid rgba(94, 82, 64, 0.12)",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"FKGroteskNeue", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
      },
    },
  },
});

export default theme;

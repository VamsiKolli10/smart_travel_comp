import { alpha, createTheme } from "@mui/material/styles";

const typography = {
  fontFamily:
    '"FKGroteskNeue", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: {
    fontSize: "2.75rem",
    fontWeight: 600,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "2.25rem",
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: "-0.015em",
  },
  h3: {
    fontSize: "1.75rem",
    fontWeight: 600,
    lineHeight: 1.25,
  },
  h4: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h5: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.35,
  },
  h6: {
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: "1rem",
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.95rem",
    lineHeight: 1.55,
  },
};

function buildPalette(mode = "light") {
  const isDark = mode === "dark";
  return {
    mode,
    primary: {
      main: "#21808D",
      light: "#32B8C6",
      dark: "#1D7480",
      contrastText: "#FCFCF9",
    },
    secondary: {
      main: "#5E5240",
      light: "#A37E52",
      dark: "#1F2121",
      contrastText: "#FCFCF9",
    },
    background: {
      default: isDark ? "#0D1F24" : "#FCFCF9",
      paper: isDark ? "#102027" : "#FFFFFD",
    },
    text: {
      primary: isDark ? "#EDF2F3" : "#13343B",
      secondary: isDark ? alpha("#EDF2F3", 0.75) : "#626C71",
    },
    divider: isDark ? alpha("#EDF2F3", 0.12) : "rgba(94,82,64,0.12)",
    error: {
      main: "#C0152F",
      light: "#FF5459",
    },
    warning: {
      main: "#A84B2F",
      light: "#E68161",
    },
    success: {
      main: "#21808D",
      light: "#32B8C6",
    },
    info: {
      main: "#626C71",
    },
  };
}

export function createAppTheme(mode = "light") {
  const palette = buildPalette(mode);
  return createTheme({
    palette,
    typography,
    shape: {
      borderRadius: 12,
    },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: typography.fontFamily,
            backgroundColor: palette.background.default,
            color: palette.text.primary,
            transition: "background-color 250ms ease, color 250ms ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 999,
            padding: "10px 20px",
            transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
            fontFamily: typography.fontFamily,
          },
          contained: {
            boxShadow: "0 20px 40px -18px rgba(33, 128, 141, 0.55)",
            "&:hover": {
              boxShadow: "0 22px 45px -18px rgba(33, 128, 141, 0.65)",
            },
          },
          outlined: {
            borderColor: palette.divider,
            "&:hover": {
              backgroundColor: alpha(palette.primary.main, 0.08),
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 20,
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 25px 60px -40px rgba(3, 6, 12, 0.85)"
                : "0 18px 55px -35px rgba(12, 32, 44, 0.22)",
            backgroundImage: "none",
            transition: "transform 200ms ease, box-shadow 200ms ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 28px 65px -38px rgba(5, 9, 16, 0.9)"
                  : "0 22px 60px -32px rgba(10, 48, 62, 0.25)",
            },
          }),
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: ({ theme }) => ({
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: alpha(theme.palette.primary.main, 0.3),
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            backdropFilter: "blur(16px)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 18px 55px -30px rgba(2, 8, 18, 0.8)"
                : "0 18px 45px -30px rgba(12, 32, 44, 0.18)",
          }),
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
          }),
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: typography.fontFamily,
          },
        },
      },
    },
  });
}

const defaultTheme = createAppTheme("light");
export default defaultTheme;

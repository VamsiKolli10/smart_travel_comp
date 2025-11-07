import { Box, Chip, Container, Stack, Typography } from "@mui/material";

export default function PageContainer({
  eyebrow,
  title,
  subtitle,
  actions,
  maxWidth = "lg",
  children,
  gap = 3,
  ...rest
}) {
  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        py: { xs: 6, md: 8 },
        px: { xs: 0, md: 0 },
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? `radial-gradient(circle at 10% 10%, rgba(50,184,198,0.12) 0%, transparent 45%),
                 radial-gradient(circle at 85% 0%, rgba(94,82,64,0.12) 0%, transparent 55%),
                 ${theme.palette.background.default}`
              : `radial-gradient(circle at 10% 10%, rgba(50,184,198,0.12) 0%, transparent 45%),
                 radial-gradient(circle at 85% 0%, rgba(94,82,64,0.1) 0%, transparent 55%),
                 ${theme.palette.background.default}`,
          zIndex: 0,
        },
      }}
      {...rest}
    >
      <Container
        maxWidth={maxWidth}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap,
          px: { xs: 2, sm: 3, md: 4 },
          position: "relative",
          zIndex: 1,
        }}
      >
        {(eyebrow || title || subtitle || actions) && (
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Stack spacing={1}>
                {eyebrow && (
                  <Chip
                    label={eyebrow}
                    color="primary"
                    variant="outlined"
                    sx={{ alignSelf: "flex-start", fontWeight: 600 }}
                  />
                )}
                {title && (
                  <Typography
                    component="h1"
                    variant="h4"
                    sx={{ fontWeight: 600, mb: subtitle ? 0.5 : 0 }}
                  >
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body1" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Stack>
            </Box>
            {actions && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                {actions}
              </Box>
            )}
          </Stack>
        )}
        {children}
      </Container>
    </Box>
  );
}

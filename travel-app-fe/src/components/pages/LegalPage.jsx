import { Container, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PageContainer from "../layout/PageContainer";

const content = {
  terms: {
    title: "Terms of Service",
    intro: "These terms describe the basic rules for using VoxTrail while planning and taking a trip.",
    sections: [
      ["Use of the service", "Use VoxTrail lawfully and keep your account credentials secure. You are responsible for activity performed through your account."],
      ["Travel information", "Translations, cultural guidance, itineraries, and search results are provided for general planning support. Confirm important details with official local sources."],
      ["Availability", "Third-party providers can change or become unavailable. We may update features as the service evolves and will communicate material changes when practical."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "This summary explains the information VoxTrail uses to provide a connected travel workspace.",
    sections: [
      ["Information we use", "Account details, saved phrases, travel preferences, destination context, and feature activity may be used to provide and improve the service."],
      ["Third-party services", "Authentication, maps and place search, hosting, analytics, and AI providers may process the information needed for their respective features."],
      ["Your choices", "You can manage saved content, sign out, and request account or data deletion through the support channel configured for your deployment."],
    ],
  },
};

export default function LegalPage({ kind }) {
  const page = content[kind] || content.terms;
  return (
    <PageContainer title={page.title} subtitle={page.intro}>
      <Container maxWidth="md" disableGutters>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, border: 1, borderColor: "divider" }}>
          <Stack spacing={3}>
            {page.sections.map(([heading, body]) => (
              <Stack key={heading} spacing={0.75}>
                <Typography variant="h6">{heading}</Typography>
                <Typography color="text.secondary">{body}</Typography>
              </Stack>
            ))}
            <Typography variant="body2" color="text.secondary">
              Need help? Return to the <RouterLink to="/">VoxTrail home page</RouterLink>.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </PageContainer>
  );
}

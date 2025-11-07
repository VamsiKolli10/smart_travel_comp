import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import PageContainer from "../layout/PageContainer";

const culturalSections = [
  {
    id: "greetings",
    title: "Greetings & Etiquette",
    icon: "👋",
    highlight: "Start every interaction with respect and a warm greeting.",
    content: [
      {
        title: "Common Greetings",
        items: [
          { phrase: "Hello", translation: "Hola", pronunciation: "OH-lah" },
          {
            phrase: "Good morning",
            translation: "Buenos días",
            pronunciation: "BWAY-nos DEE-ahs",
          },
          {
            phrase: "Good afternoon",
            translation: "Buenas tardes",
            pronunciation: "BWAY-nas TAR-des",
          },
          {
            phrase: "Good evening",
            translation: "Buenas noches",
            pronunciation: "BWAY-nas NO-ches",
          },
        ],
      },
      {
        title: "Polite Expressions",
        items: [
          {
            phrase: "Please",
            translation: "Por favor",
            pronunciation: "por fa-VOR",
          },
          {
            phrase: "Thank you",
            translation: "Gracias",
            pronunciation: "GRAH-see-ahs",
          },
          {
            phrase: "You're welcome",
            translation: "De nada",
            pronunciation: "deh NAH-dah",
          },
          {
            phrase: "Excuse me",
            translation: "Disculpe",
            pronunciation: "dis-KOOL-peh",
          },
        ],
      },
    ],
  },
  {
    id: "dining",
    title: "Dining & Food",
    icon: "🍽️",
    highlight: "Embrace local dining customs to make every meal memorable.",
    content: [
      {
        title: "Dining Etiquette",
        items: [
          {
            phrase: "Table for two",
            translation: "Mesa para dos",
            pronunciation: "MEH-sah PAH-rah dos",
          },
          {
            phrase: "The menu, please",
            translation: "La carta, por favor",
            pronunciation: "lah KAR-tah por fa-VOR",
          },
          {
            phrase: "I'm vegetarian",
            translation: "Soy vegetariano/a",
            pronunciation: "soy veh-heh-tah-ree-AH-no/ah",
          },
          {
            phrase: "The check, please",
            translation: "La cuenta, por favor",
            pronunciation: "lah KWEN-tah por fa-VOR",
          },
        ],
      },
      {
        title: "Tipping Culture",
        items: [
          {
            phrase: "Tip included",
            translation: "Propina incluida",
            pronunciation: "pro-PEE-nah in-kloo-EE-dah",
          },
          {
            phrase: "Keep the change",
            translation: "Quédese con el cambio",
            pronunciation: "KEH-deh-seh kon el KAHM-bee-oh",
          },
          {
            phrase: "Service charge",
            translation: "Cargo por servicio",
            pronunciation: "KAR-goh por ser-VEE-see-oh",
          },
        ],
      },
    ],
  },
  {
    id: "customs",
    title: "Local Customs",
    icon: "🏛️",
    highlight: "Learn how everyday life flows to blend in effortlessly.",
    content: [
      {
        title: "Cultural Norms",
        items: [
          {
            phrase: "Business hours",
            translation: "Horario comercial",
            pronunciation: "oh-RAH-ree-oh ko-mer-see-AHL",
          },
          {
            phrase: "Closed on Sunday",
            translation: "Cerrado los domingos",
            pronunciation: "seh-RAH-doh los doh-MEEN-gos",
          },
          {
            phrase: "Public holiday",
            translation: "Día festivo",
            pronunciation: "DEE-ah fes-TEE-voh",
          },
        ],
      },
      {
        title: "Social Customs",
        items: [
          {
            phrase: "Personal space",
            translation: "Espacio personal",
            pronunciation: "es-PAH-see-oh per-soh-NAHL",
          },
          {
            phrase: "Eye contact",
            translation: "Contacto visual",
            pronunciation: "kon-TAHK-toh vee-SWAHL",
          },
          {
            phrase: "Handshake",
            translation: "Apretón de manos",
            pronunciation: "ah-preh-TOHN deh MAH-nos",
          },
        ],
      },
    ],
  },
  {
    id: "emergency",
    title: "Emergency Situations",
    icon: "🚨",
    highlight: "Know the phrases that matter when every second counts.",
    content: [
      {
        title: "Emergency Phrases",
        items: [
          { phrase: "Help!", translation: "¡Ayuda!", pronunciation: "ah-YOO-dah" },
          {
            phrase: "Call the police",
            translation: "Llame a la policía",
            pronunciation: "YAH-meh ah lah po-lee-SEE-ah",
          },
          {
            phrase: "I need a doctor",
            translation: "Necesito un médico",
            pronunciation: "neh-seh-SEE-toh oon MEH-dee-koh",
          },
          {
            phrase: "Where is the hospital?",
            translation: "¿Dónde está el hospital?",
            pronunciation: "DOHN-deh es-TAH el os-pee-TAHL",
          },
        ],
      },
    ],
  },
];

export default function CulturalGuide() {
  const [activeSection, setActiveSection] = useState("greetings");

  const section = useMemo(
    () => culturalSections.find((item) => item.id === activeSection) || culturalSections[0],
    [activeSection]
  );

  return (
    <PageContainer
      title="Cultural Guide"
      subtitle="Understand local etiquette, customs, and essential expressions before you arrive."
      maxWidth="lg"
    >
      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Choose a section to explore focused guidance. Each module pairs useful phrases with pronunciation tips so you can speak with confidence.
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              {culturalSections.map((item) => (
                <Chip
                  key={item.id}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>{item.icon}</span>
                      <span>{item.title}</span>
                    </Box>
                  }
                  onClick={() => setActiveSection(item.id)}
                  color={section.id === item.id ? "primary" : "default"}
                  variant={section.id === item.id ? "filled" : "outlined"}
                  sx={{ borderRadius: 3, fontWeight: 500 }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ fontSize: 36 }}>{section.icon}</Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.highlight}
                  </Typography>
                </Box>
              </Stack>
              <Divider />
            </Stack>

            <Grid container spacing={2}>
              {section.content.map((group) => (
                <Grid item xs={12} md={6} key={group.title}>
                  <Card
                    variant="outlined"
                    sx={{ borderRadius: 3, height: "100%" }}
                  >
                    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {group.title}
                      </Typography>
                      <List disablePadding>
                        {group.items.map((item) => (
                          <ListItem
                            key={`${item.phrase}-${item.translation}`}
                            disablePadding
                            sx={{ mb: 1.5, alignItems: "flex-start" }}
                          >
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {item.phrase}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.translation}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.pronunciation}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </PageContainer>
  );
}

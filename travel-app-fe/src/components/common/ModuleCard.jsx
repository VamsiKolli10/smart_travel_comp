import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledModuleCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "interactive",
})(({ theme, interactive }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 220,
  borderRadius: 24,
  transition: interactive
    ? "transform 200ms ease, box-shadow 200ms ease"
    : "box-shadow 200ms ease",
  [theme.breakpoints.down("sm")]: {
    minHeight: 200,
  },
  ...(interactive && {
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[6],
    },
  }),
}));

export function ModuleCard({ interactive = false, sx, onClick, ...props }) {
  return (
    <StyledModuleCard
      interactive={interactive ? 1 : 0}
      elevation={0}
      sx={sx}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if ((event.key === "Enter" || event.key === " ") && onClick) {
                event.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
      {...props}
    />
  );
}

const StyledModuleCardGrid = styled("div")(({ theme }) => ({
  display: "grid",
  width: "100%",
  gap: theme.spacing(3),
  alignItems: "stretch",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
}));

export function ModuleCardGrid({ children, sx, ...props }) {
  return (
    <StyledModuleCardGrid sx={sx} {...props}>
      {children}
    </StyledModuleCardGrid>
  );
}

export default ModuleCard;

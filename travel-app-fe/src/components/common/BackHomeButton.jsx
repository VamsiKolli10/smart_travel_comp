import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function BackHomeButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/")}
      startIcon={<ArrowBackIcon />}
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        color: "primary.main",
        fontWeight: "bold",
      }}
    >
      Back Home
    </Button>
  );
}

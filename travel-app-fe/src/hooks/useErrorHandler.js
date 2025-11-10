import { useState } from "react";
import { useNotification } from "./useNotification";

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const handleError = (error) => {
    console.error("Error:", error);
    setError(error);
    showNotification(
      error?.response?.data?.message || error?.message || "An error occurred",
      "error"
    );
  };

  const clearError = () => {
    setError(null);
  };

  return { error, handleError, clearError };
};

import { useState, useCallback } from "react";

export default function useNotification() {
  const [message, setMessage] = useState(null);
  const [type, setType] = useState("info");
  const [show, setShow] = useState(false);

  const showNotification = useCallback((msg, notifType = "info") => {
    setMessage(msg);
    setType(notifType);
    setShow(true);

    setTimeout(() => setShow(false), 3000);
  }, []);

  const hideNotification = useCallback(() => {
    setShow(false);
  }, []);

  return {
    message,
    type,
    show,
    showNotification,
    hideNotification,
  };
}

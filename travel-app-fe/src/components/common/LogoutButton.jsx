import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../../store/slices/authSlice";
import { logout } from "../../services/auth";
import Button from "./Button";
import useNotification from "../../hooks/useNotification";

export default function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(clearUser());
      await persistor.purge();
      showNotification("Logged out successfully", "success");
      navigate("/");
    } catch (err) {
      showNotification("Logout failed. Please try again.", "error");
    }
  };

  return (
    <Button variant="outlined" onClick={handleLogout}>
      Logout
    </Button>
  );
}

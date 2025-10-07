import { configureStore } from "@reduxjs/toolkit";
import app from "./slices/appSlice";
import translation from "./slices/translationSlice";
import phrasebook from "./slices/phrasebookSlice";
import accommodation from "./slices/accommodationSlice";
import auth from "./slices/authSlice";

const store = configureStore({
  reducer: { app, translation, phrasebook, accommodation, auth },
});

export default store;

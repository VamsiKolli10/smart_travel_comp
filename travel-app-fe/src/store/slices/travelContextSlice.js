import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  destination: "",
  destinationDisplayName: "",
  destinationCity: "",
  destinationState: "",
  destinationCountry: "",
  destinationLat: null,
  destinationLng: null,
  culture: "",
  language: "en",
  sourceLanguageCode: "en",
  sourceLanguageName: "English",
  targetLanguageCode: "es",
  targetLanguageName: "Spanish",
  lastUpdatedBy: null,
  updatedAt: null,
};

const travelContextSlice = createSlice({
  name: "travelContext",
  initialState,
  reducers: {
    setTravelContext(state, action) {
      const payload = action.payload || {};

      if (payload.destination !== undefined) {
        state.destination = (
          typeof payload.destination === "string"
            ? payload.destination
            : ""
        ).trim();
      }
      if (payload.destinationDisplayName !== undefined) {
        state.destinationDisplayName = (
          typeof payload.destinationDisplayName === "string"
            ? payload.destinationDisplayName
            : ""
        ).trim();
      }
      if (payload.destinationCity !== undefined) {
        state.destinationCity = (
          typeof payload.destinationCity === "string"
            ? payload.destinationCity
            : ""
        ).trim();
      }
      if (payload.destinationState !== undefined) {
        state.destinationState = (
          typeof payload.destinationState === "string"
            ? payload.destinationState
            : ""
        ).trim();
      }
      if (payload.destinationCountry !== undefined) {
        state.destinationCountry = (
          typeof payload.destinationCountry === "string"
            ? payload.destinationCountry
            : ""
        ).trim();
      }
      if (payload.destinationLat !== undefined) {
        const next = payload.destinationLat;
        state.destinationLat =
          typeof next === "number" && Number.isFinite(next) ? next : null;
      }
      if (payload.destinationLng !== undefined) {
        const next = payload.destinationLng;
        state.destinationLng =
          typeof next === "number" && Number.isFinite(next) ? next : null;
      }
      if (payload.culture !== undefined) {
        state.culture = (
          typeof payload.culture === "string" ? payload.culture : ""
        ).trim();
      }
      if (payload.language !== undefined) {
        const next =
          typeof payload.language === "string"
            ? payload.language.trim()
            : "";
        state.language = next || "en";
      }
      if (payload.sourceLanguageCode !== undefined) {
        const next =
          typeof payload.sourceLanguageCode === "string"
            ? payload.sourceLanguageCode.trim().toLowerCase()
            : "";
        state.sourceLanguageCode = next || "en";
      }
      if (payload.sourceLanguageName !== undefined) {
        state.sourceLanguageName = (
          typeof payload.sourceLanguageName === "string"
            ? payload.sourceLanguageName
            : ""
        ).trim();
      }
      if (payload.targetLanguageCode !== undefined) {
        const next =
          typeof payload.targetLanguageCode === "string"
            ? payload.targetLanguageCode.trim().toLowerCase()
            : "";
        state.targetLanguageCode = next || "es";
        if (payload.language === undefined && next) {
          state.language = next;
        }
      }
      if (payload.targetLanguageName !== undefined) {
        state.targetLanguageName = (
          typeof payload.targetLanguageName === "string"
            ? payload.targetLanguageName
            : ""
        ).trim();
      }
      state.lastUpdatedBy = payload.source || null;
      state.updatedAt = Date.now();
    },
    clearTravelContext() {
      return { ...initialState, updatedAt: Date.now() };
    },
  },
});

export const { setTravelContext, clearTravelContext } = travelContextSlice.actions;
export default travelContextSlice.reducer;

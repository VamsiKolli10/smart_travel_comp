const LANGUAGE_DEFINITIONS = [
  { code: "en", label: "English", supportsTranslation: true },
  { code: "es", label: "Spanish", supportsTranslation: true },
  { code: "fr", label: "French", supportsTranslation: true },
  { code: "de", label: "German", supportsTranslation: true },
];
// not supported for now
// { code: "it", label: "Italian" },
// { code: "pt", label: "Portuguese" },
// { code: "hi", label: "Hindi" },
// { code: "zh", label: "Chinese" },
// { code: "ja", label: "Japanese" },
// { code: "ko", label: "Korean" },
// { code: "ar", label: "Arabic" },
// { code: "ru", label: "Russian" },
// { code: "tr", label: "Turkish" },
// { code: "th", label: "Thai" },
// { code: "id", label: "Indonesian" },

export const TRANSLATION_LANGUAGES = LANGUAGE_DEFINITIONS.filter(
  (lang) => lang.supportsTranslation
);

export const COMMON_LANGUAGE_LABELS = LANGUAGE_DEFINITIONS.map(
  (lang) => lang.label
);

export const LANGUAGE_CODE_TO_LABEL = LANGUAGE_DEFINITIONS.reduce(
  (acc, lang) => {
    acc[lang.code.toLowerCase()] = lang.label;
    return acc;
  },
  {}
);

export const LANGUAGE_LABEL_TO_CODE = LANGUAGE_DEFINITIONS.reduce(
  (acc, lang) => {
    acc[lang.label.toLowerCase()] = lang.code;
    return acc;
  },
  {}
);

export function getLanguageLabel(code) {
  if (!code) return "";
  const normalized = String(code).trim().toLowerCase();
  return (
    LANGUAGE_CODE_TO_LABEL[normalized] ||
    LANGUAGE_CODE_TO_LABEL[code] ||
    code.toUpperCase()
  );
}

export function resolveLanguageCode(label) {
  if (!label) return "";
  const normalized = String(label).trim();
  const lookup = LANGUAGE_LABEL_TO_CODE[normalized.toLowerCase()];
  if (lookup) return lookup;

  const lowered = normalized.toLowerCase();
  if (/^[a-z]{2,3}$/.test(lowered)) {
    return lowered;
  }
  return "";
}

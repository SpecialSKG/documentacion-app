// config/features.ts
export const features = {
  drafts: process.env.NEXT_PUBLIC_ENABLE_DRAFTS === "true", // OFF por defecto
  autosave: true,
  maxDrafts: 5,
} as const;

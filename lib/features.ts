export const features = {
  training: process.env.NEXT_PUBLIC_FEATURE_TRAINING === "true",
  leagues: process.env.NEXT_PUBLIC_FEATURE_LEAGUES === "true",
} as const

export type FeatureKey = keyof typeof features

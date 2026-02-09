/**
 * OG Image Utilities
 * Shared constants and helpers for OpenGraph image generation
 */

// OG Image dimensions (standard for social platforms)
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const ogImageSize = {
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
};

// Color palette matching site design (from globals.css)
export const ogColors = {
  // Backgrounds
  background: "#080808",
  muted: "#121212",
  muted2: "#161616",
  muted3: "#1a1a1a",
  muted4: "#232323",

  // Foregrounds
  foreground: "#ededed",
  mutedForeground: "#6b6b6b",

  // Accents
  accent: "#FF6B00", // Dieter Rams orange

  // Opacity variations for text
  fg90: "rgba(237, 237, 237, 0.9)",
  fg70: "rgba(237, 237, 237, 0.7)",
  fg50: "rgba(237, 237, 237, 0.5)",
  fg30: "rgba(237, 237, 237, 0.3)",
  fg20: "rgba(237, 237, 237, 0.2)",
  fg10: "rgba(237, 237, 237, 0.1)",
} as const;

// Common styles for OG images (inline styles required for ImageResponse)
export const ogStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    width: "100%",
    height: "100%",
    backgroundColor: ogColors.background,
    padding: "60px",
  },
  title: {
    fontSize: "72px",
    fontWeight: 600,
    color: ogColors.foreground,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: "32px",
    color: ogColors.fg70,
    letterSpacing: "-0.01em",
    lineHeight: 1.4,
  },
  experimentNumber: {
    fontSize: "180px",
    fontWeight: 700,
    color: ogColors.accent,
    letterSpacing: "-0.04em",
    lineHeight: 1,
  },
  tag: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    backgroundColor: ogColors.fg10,
    borderRadius: "6px",
    fontSize: "18px",
    color: ogColors.fg70,
  },
  divider: {
    width: "100%",
    height: "1px",
    backgroundColor: ogColors.fg10,
  },
} as const;

// Format experiment number with leading zeros
export function formatExperimentNumber(num: number): string {
  return String(num).padStart(3, "0");
}

// Site metadata constants
export const siteConfig = {
  name: "Gallery",
  description: "WebGL and Three.js experiments",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://experiments.gallery",
} as const;

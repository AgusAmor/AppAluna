/**
 * THEME CONFIGURATION
 *
 * Single source of truth for all color definitions.
 * Define your brand colors and theme mappings here.
 * Easily modify colors without touching other files.
 */

// ============================================
// BRAND COLOR PALETTE
// ============================================

export const brandPalette = {
  blue1: "#264e60",
  blue2: "#427385",
  blue3: "#81a5ae",

  gray1: "#a9b2b9",
  gray2: "#c3c9ce",
  gray3: "#d9dce0",

  black: "#2b2b2b",
  white: "#f4f4f4",

  gold: "#b6a269",

  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

// ============================================
// THEME MODES CONFIGURATION
// ============================================

export const themeConfig = {
  light: {
    // Backgrounds
    background: brandPalette.white,
    backgroundLight: "#fafafa",
    backgroundLight2: "#f3f4f6",

    // Text
    text: brandPalette.black,
    textLight: brandPalette.gray1,
    textLighter: brandPalette.gray2,

    // Primary
    primary: brandPalette.blue2,
    primaryDark: brandPalette.blue1,
    primaryLight: brandPalette.blue3,

    // Secondary
    secondary: brandPalette.gray2,
    secondaryLight: brandPalette.gray3,

    // Accent
    accent: brandPalette.gold,

    // Borders
    border: brandPalette.gray3,
    borderLight: brandPalette.gray2,

    // Status
    success: brandPalette.success,
    error: brandPalette.error,
    warning: brandPalette.warning,
    info: brandPalette.info,
  },

  dark: {
    // Backgrounds
    background: "#0d0d0d",
    backgroundLight: "#1a1a1a",
    backgroundLight2: "#262626",

    // Text (inverted for readability)
    text: "#f5f5f5",
    textLight: "#b0d0e0",
    textLighter: "#808080",

    // Primary
    primary: brandPalette.blue3,
    primaryDark: brandPalette.blue2,
    primaryLight: brandPalette.blue1,

    // Secondary
    secondary: brandPalette.gray3,
    secondaryLight: brandPalette.gray2,

    // Accent
    accent: brandPalette.gold,

    // Borders
    border: brandPalette.gray2,
    borderLight: brandPalette.gray1,

    // Status (brightened for dark mode)
    success: "#34d399",
    error: "#f87171",
    warning: "#fbbf24",
    info: "#60a5fa",
  },
};

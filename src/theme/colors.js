/**
 * Color Theme Hook
 *
 * Automatically adapts to device color scheme (light/dark).
 * This is the only file you need to import for colors.
 */

import { useColorScheme, Appearance } from "react-native";
import { themeConfig } from "./themeConfig";

/**
 * Hook to get adaptive colors based on device preference
 *
 * Returns:
 * - colorScheme: Color values for current mode
 * - isDark: Boolean indicating dark mode status
 *
 * Usage:
 * const { colorScheme, isDark } = useThemeColors();
 */
export function useThemeColors() {
  // Try useColorScheme first, fallback to Appearance.getColorScheme()
  let scheme = useColorScheme() || Appearance.getColorScheme() || "light";
  const isDark = scheme === "dark";

  return {
    colorScheme: isDark ? themeConfig.dark : themeConfig.light,
    isDark,
  };
}

export { themeConfig };

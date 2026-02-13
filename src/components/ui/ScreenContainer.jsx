import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../theme";

/**
 * ScreenContainer
 * Unified container for all screens with safe area insets handling
 * Centralizes padding, flex layout, and background color management
 * Adapts background color to device theme (light/dark mode)
 *
 * @param {React.ReactNode} children - Screen content
 * @param {string} backgroundColor - Background color (default: theme background)
 * @param {boolean} centered - Center content vertically and horizontally
 * @param {object} style - Additional custom styles
 */
const ScreenContainer = ({
  children,
  backgroundColor,
  centered = false,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useThemeColors();

  // Use theme background if no backgroundColor is provided
  const bgColor = backgroundColor || colorScheme.background;

  return (
    <View
      style={[
        styles.container,
        centered && styles.centered,
        {
          backgroundColor: bgColor,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ScreenContainer;

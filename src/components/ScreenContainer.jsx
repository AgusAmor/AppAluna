import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * ScreenContainer
 * Unified container for all screens with safe area insets handling
 * Centralizes padding, flex layout, and background color management
 *
 * @param {React.ReactNode} children - Screen content
 * @param {string} backgroundColor - Background color (default: #FFFFFF)
 * @param {boolean} centered - Center content vertically and horizontally
 * @param {object} style - Additional custom styles
 */
const ScreenContainer = ({
  children,
  backgroundColor = "#FFFFFF",
  centered = false,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        centered && styles.centered,
        {
          backgroundColor,
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

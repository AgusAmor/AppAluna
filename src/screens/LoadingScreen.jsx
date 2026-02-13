import React from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import { useThemeColors, fonts } from "../theme";

const LoadingScreen = () => {
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  return (
    <ScreenContainer centered>
      <ActivityIndicator size="large" color={colorScheme.primary} />
      <Text style={styles.text}>Cargando...</Text>
    </ScreenContainer>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    text: {
      marginTop: 16,
      ...fonts.body.base,
      color: colorScheme.textLight,
    },
  });

export default LoadingScreen;

import React from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";

const LoadingScreen = () => {
  return (
    <ScreenContainer centered>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.text}>Cargando...</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
});

export default LoadingScreen;

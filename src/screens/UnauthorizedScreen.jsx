import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useThemeColors, fonts } from "../theme";

const UnauthorizedScreen = () => {
  const { user, logout } = useAuth();
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ScreenContainer backgroundColor={colorScheme.background} centered>
      <View style={styles.card}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Acceso Denegado</Text>
        <Text style={styles.message}>
          No tienes permisos de administrador para acceder a esta aplicación.
        </Text>
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: colorScheme.background,
      borderRadius: 12,
      padding: 24,
      alignItems: "center",
      borderWidth: 2,
      borderColor: colorScheme.error,
    },
    icon: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      ...fonts.heading.h2,
      color: colorScheme.text,
      marginBottom: 12,
      textAlign: "center",
    },
    message: {
      ...fonts.body.base,
      color: colorScheme.textLight,
      marginBottom: 16,
      textAlign: "center",
    },
    email: {
      ...fonts.body.sm,
      color: colorScheme.textLighter,
      marginBottom: 24,
      fontStyle: "italic",
    },
    button: {
      backgroundColor: colorScheme.error,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    buttonText: {
      color: colorScheme.background,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default UnauthorizedScreen;

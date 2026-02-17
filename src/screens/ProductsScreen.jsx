import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useThemeColors, fonts } from "../theme";

const ProductsScreen = () => {
  const { user } = useAuth();
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Gestión de Productos</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Productos</Text>
        <Text style={styles.placeholderSubtext}>
          Aquí irá la lista de productos
        </Text>
      </View>
    </ScreenContainer>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    title: {
      ...fonts.heading.h2,
      color: colorScheme.text,
      marginBottom: 8,
    },
    email: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 32,
    },
    placeholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colorScheme.backgroundLight2,
      borderRadius: 12,
      marginBottom: 20,
    },
    placeholderText: {
      fontSize: 18,
      fontWeight: "600",
      color: colorScheme.text,
      marginBottom: 8,
    },
    placeholderSubtext: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
    },
    logoutButton: {
      backgroundColor: colorScheme.error,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      marginBottom: 20,
    },
    logoutText: {
      color: colorScheme.background,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default ProductsScreen;

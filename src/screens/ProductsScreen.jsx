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
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Productos</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

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
    header: {
      marginTop: 20,
      marginBottom: 32,
    },
    title: {
      ...fonts.heading.h1,
      color: colorScheme.text,
      marginBottom: 4,
    },
    subtitle: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 2,
    },
    email: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
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
      ...fonts.heading.h4,
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
      ...fonts.button,
      color: colorScheme.background,
    },
  });

export default ProductsScreen;

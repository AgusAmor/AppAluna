import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useThemeColors, fonts } from "../theme";

const HomeScreen = ({ navigation }) => {
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
    <ScreenContainer backgroundColor={colorScheme.backgroundLight2}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel Admin Aluna</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Orders")}
        >
          <Text style={styles.cardIcon}>📦</Text>
          <Text style={styles.cardTitle}>Pedidos</Text>
          <Text style={styles.cardSubtitle}>Gestionar órdenes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Products")}
        >
          <Text style={styles.cardIcon}>🛍️</Text>
          <Text style={styles.cardTitle}>Productos</Text>
          <Text style={styles.cardSubtitle}>Gestionar catálogo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Users")}
        >
          <Text style={styles.cardIcon}>👥</Text>
          <Text style={styles.cardTitle}>Usuarios</Text>
          <Text style={styles.cardSubtitle}>Gestionar usuarios</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
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
      ...fonts.heading.h2,
      color: colorScheme.text,
      marginBottom: 8,
    },
    email: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
    },
    grid: {
      flex: 1,
      gap: 16,
    },
    card: {
      backgroundColor: colorScheme.background,
      borderRadius: 12,
      padding: 20,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      marginBottom: 8,
    },
    cardIcon: {
      fontSize: 40,
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colorScheme.text,
      marginBottom: 4,
    },
    cardSubtitle: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      textAlign: "center",
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

export default HomeScreen;

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useThemeColors, fonts } from "../theme";

const OrdersScreen = ({ navigation }) => {
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
    <ScreenContainer>
      <Text style={styles.title}>Gestión de Pedidos</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Órdenes</Text>
        <Text style={styles.placeholderSubtext}>
          Aquí irá la lista de órdenes
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
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

export default OrdersScreen;

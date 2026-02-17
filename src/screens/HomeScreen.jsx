import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Package, ShoppingBag, Users } from "lucide-react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useThemeColors, fonts } from "../theme";

const HomeScreen = () => {
  const { user } = useAuth();
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  return (
    <ScreenContainer backgroundColor={colorScheme.backgroundLight2}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel Admin Aluna</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Package
            size={40}
            color={colorScheme.primary}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.cardTitle}>Pedidos</Text>
          <Text style={styles.cardSubtitle}>Gestionar órdenes</Text>
        </View>

        <View style={styles.card}>
          <ShoppingBag
            size={40}
            color={colorScheme.primary}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.cardTitle}>Productos</Text>
          <Text style={styles.cardSubtitle}>Gestionar catálogo</Text>
        </View>

        <View style={styles.card}>
          <Users
            size={40}
            color={colorScheme.primary}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.cardTitle}>Usuarios</Text>
          <Text style={styles.cardSubtitle}>Gestionar usuarios</Text>
        </View>
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
  });

export default HomeScreen;

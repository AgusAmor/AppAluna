import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useThemeColors, fonts } from "../theme";
import { useDashboardStats } from "../hooks/screens";

const HomeScreen = () => {
  const { user } = useAuth();
  const { colorScheme } = useThemeColors();
  const { stats, loading, error } = useDashboardStats();
  const styles = createStyles(colorScheme);

  const formatCurrency = (value) => {
    return value.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  };

  return (
    <ScreenContainer backgroundColor={colorScheme.backgroundLight2}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administración</Text>
        <Text style={styles.subtitle}>
          Gestiona productos, pedidos y usuarios
        </Text>
      </View>

      {error && (
        <View style={[styles.errorBox, { borderColor: colorScheme.error }]}>
          <Text style={[styles.errorText, { color: colorScheme.error }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Productos"
          value={
            loading ? (
              <ActivityIndicator color={colorScheme.primary} />
            ) : (
              stats.totalProducts
            )
          }
          icon={<Package size={32} color={colorScheme.primary} />}
          colorScheme={colorScheme}
        />
        <StatCard
          title="Pedidos Hoy"
          value={
            loading ? (
              <ActivityIndicator color={colorScheme.primary} />
            ) : (
              stats.ordersToday
            )
          }
          icon={<ShoppingBag size={32} color={colorScheme.primary} />}
          colorScheme={colorScheme}
        />
        <StatCard
          title="Usuarios Registrados"
          value={
            loading ? (
              <ActivityIndicator color={colorScheme.primary} />
            ) : (
              stats.registeredUsers
            )
          }
          icon={<Users size={32} color={colorScheme.primary} />}
          colorScheme={colorScheme}
        />
        <StatCard
          title="Ingresos del Mes"
          value={
            loading ? (
              <ActivityIndicator color={colorScheme.primary} />
            ) : (
              formatCurrency(stats.monthlyRevenue)
            )
          }
          icon={<DollarSign size={32} color={colorScheme.primary} />}
          colorScheme={colorScheme}
        />
      </View>
    </ScreenContainer>
  );
};

const StatCard = ({ title, value, icon, colorScheme }) => {
  const styles = createStyles(colorScheme);
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>{icon}</View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{title}</Text>
        {typeof value === "number" ? (
          <Text style={styles.statValue}>{value}</Text>
        ) : typeof value === "string" ? (
          <Text style={styles.statValue}>{value}</Text>
        ) : (
          value
        )}
      </View>
    </View>
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
    subtitle: {
      ...fonts.body.base,
      color: colorScheme.textLight,
    },
    errorBox: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      backgroundColor: colorScheme.background + "20",
    },
    errorText: {
      ...fonts.body.sm,
      textAlign: "center",
    },
    statsGrid: {
      gap: 16,
      marginBottom: 24,
    },
    statCard: {
      backgroundColor: colorScheme.background,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colorScheme.border + "40",
      shadowColor: colorScheme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 14,
      backgroundColor: colorScheme.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    statContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 12,
    },
    statLabel: {
      ...fonts.heading.h4,
      color: colorScheme.textLight,
      fontWeight: "500",
      marginBottom: 4,
      textAlign: "center",
    },
    statValueContainer: {
      minHeight: 32,
      justifyContent: "center",
    },
    statValue: {
      ...fonts.heading.h4,
      color: colorScheme.primary,
      textAlign: "center",
      fontWeight: "700",
    },
  });

export default HomeScreen;

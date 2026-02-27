/**
 * StatCard Component
 * Displays a stat card with icon, title, and value
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { fonts } from "../../theme";

/**
 * StatCard
 * @param {string} title - Card title
 * @param {number|string|JSX} value - Card value (can be formatted JSX)
 * @param {JSX.Element} icon - Icon element
 * @param {object} colorScheme - Theme color scheme
 * @returns {JSX.Element}
 */
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
    statValue: {
      ...fonts.heading.h4,
      color: colorScheme.primary,
      textAlign: "center",
      fontWeight: "700",
    },
  });

export default StatCard;

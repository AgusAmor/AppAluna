/**
 * StatusBadge.jsx
 * Reusable status badge component for displaying order/entity status
 * Uses color schemes matching web version for consistency
 *
 * Usage:
 *  <StatusBadge status="pending" />
 *  <StatusBadge status="delivered" size="small" />
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme";

// Order status constants
const STATUS_TYPES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PRINTING: "printing",
  DISPATCHED: "dispatched",
  DELIVERED: "delivered",
  WITHDRAWN: "withdrawn",
  CANCELLED: "cancelled",
};

/**
 * StatusBadge Component
 * Displays status with appropriate color coding
 *
 * @param {string} status - Status key from STATUS_TYPES
 * @param {string} size - Size variant: 'small' | 'medium' | 'large' (default: 'medium')
 * @param {object} style - Additional style overrides
 */
const StatusBadge = ({ status = "pending", size = "medium", style }) => {
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  // Get color config based on status
  const getStatusConfig = (status) => {
    const configMap = {
      [STATUS_TYPES.PENDING]: {
        backgroundColor: "#FEF08A", // yellow-100
        textColor: "#854D0E", // yellow-700
        label: "Pendiente",
      },
      [STATUS_TYPES.CONFIRMED]: {
        backgroundColor: "#DBEAFE", // blue-100
        textColor: "#1E40AF", // blue-700
        label: "Confirmado",
      },
      [STATUS_TYPES.PRINTING]: {
        backgroundColor: "#FED7AA", // orange-100
        textColor: "#B45309", // orange-700
        label: "Imprimiendo",
      },
      [STATUS_TYPES.DISPATCHED]: {
        backgroundColor: "#E9D5FF", // purple-100
        textColor: "#6B21A8", // purple-700
        label: "Despachado",
      },
      [STATUS_TYPES.DELIVERED]: {
        backgroundColor: "#DCFCE7", // green-100
        textColor: "#15803D", // green-700
        label: "Entregado",
      },
      [STATUS_TYPES.WITHDRAWN]: {
        backgroundColor: "#DCFCE7", // green-100
        textColor: "#15803D", // green-700
        label: "Retirado",
      },
      [STATUS_TYPES.CANCELLED]: {
        backgroundColor: "#FEE2E2", // red-100
        textColor: "#DC2626", // red-600
        label: "Cancelado",
      },
    };

    return (
      configMap[status] || {
        backgroundColor: "#F3F4F6", // gray-100
        textColor: "#374151", // gray-700
        label: status || "Desconocido",
      }
    );
  };

  // Get size config
  const getSizeConfig = (size) => {
    const sizeMap = {
      small: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        fontSize: 11,
      },
      medium: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        fontSize: 12,
      },
      large: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
      },
    };
    return sizeMap[size] || sizeMap.medium;
  };

  const statusConfig = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusConfig.backgroundColor,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          paddingVertical: sizeConfig.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: statusConfig.textColor,
            fontSize: sizeConfig.fontSize,
          },
        ]}
      >
        {statusConfig.label}
      </Text>
    </View>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    badge: {
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "flex-start",
    },
    badgeText: {
      fontWeight: "700",
      letterSpacing: 0.3,
    },
  });

export default StatusBadge;

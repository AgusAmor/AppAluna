/**
 * OrderCard Component
 * Displays a single order with all its details
 * Includes customer info, delivery details, items, and total
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBadge } from "../ui";
import { formatDeliveryInfo } from "../../utils/addressFormatter";
import { fonts } from "../../theme";

/**
 * OrderCard
 * @param {object} order - Order data object
 * @param {object} colorScheme - Theme color scheme
 * @returns {JSX.Element}
 */
const OrderCard = ({ order, colorScheme }) => {
  const styles = createStyles(colorScheme);
  const deliveryInfo = formatDeliveryInfo(order.delivery);

  return (
    <View style={styles.orderCard}>
      {/* Header: Order Number and Status */}
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{order.orderNumber || order.id}</Text>
        <StatusBadge status={order.status} size="medium" />
      </View>

      {/* Customer and Email in same row */}
      <View style={styles.orderDetails}>
        <View style={styles.nameEmailRow}>
          <View style={styles.nameColumn}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>
              {order.customerInfo?.name || "No especificado"}
            </Text>
          </View>
          <View style={styles.emailColumn}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value} numberOfLines={2}>
              {order.customerInfo?.email || "No especificado"}
            </Text>
          </View>
        </View>

        {/* Delivery Info */}
        {deliveryInfo && (
          <View style={styles.deliverySection}>
            <Text style={[styles.label, { marginTop: 8 }]}>
              {deliveryInfo.displayType}
            </Text>
            {deliveryInfo.address ? (
              <Text style={styles.value}>{deliveryInfo.address}</Text>
            ) : (
              <Text style={styles.value}>Retiro en Local</Text>
            )}
          </View>
        )}
      </View>

      {/* Items List */}
      {order.items && order.items.length > 0 && (
        <View style={styles.itemsList}>
          <Text style={styles.itemsLabel}>Items ({order.items.length})</Text>
          {order.items.map((itemDetail, index) => (
            <Text key={index} style={styles.itemText}>
              • {itemDetail.productName}
              {itemDetail.size && ` (${itemDetail.size})`} x
              {itemDetail.quantity}
            </Text>
          ))}
        </View>
      )}

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          ${(order.summary?.total || 0).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    orderCard: {
      backgroundColor: colorScheme.backgroundLight2,
      borderRadius: 8,
      padding: 9,
      borderLeftWidth: 4,
      borderLeftColor: colorScheme.primary,
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    orderNumber: {
      ...fonts.heading.h3,
      color: colorScheme.text,
      fontWeight: "600",
      flex: 1,
    },
    orderDetails: {
      marginBottom: 8,
    },
    nameEmailRow: {
      flexDirection: "row",
      gap: 12,
    },
    nameColumn: {
      flex: 1,
    },
    emailColumn: {
      flex: 1,
    },
    deliverySection: {
      marginTop: 4,
    },
    totalSection: {
      marginTop: 6,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colorScheme.border,
    },
    totalLabel: {
      ...fonts.body.base,
      color: colorScheme.accent,
      textTransform: "uppercase",
      letterSpacing: 0.4,
      fontWeight: "600",
      fontSize: 11,
    },
    totalValue: {
      ...fonts.heading.h2,
      color: colorScheme.accent,
      fontWeight: "700",
    },
    label: {
      ...fonts.body.xs,
      color: colorScheme.textLight,
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginBottom: 1,
      fontWeight: "600",
      fontSize: 11,
    },
    value: {
      ...fonts.body.sm,
      color: colorScheme.text,
      lineHeight: 17,
    },
    itemsList: {
      marginTop: 8,
    },
    itemsLabel: {
      ...fonts.body.xs,
      color: colorScheme.textLight,
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginBottom: 4,
      fontWeight: "600",
      fontSize: 11,
    },
    itemText: {
      ...fonts.body.sm,
      color: colorScheme.text,
      lineHeight: 17,
      marginBottom: 2,
    },
  });

export default OrderCard;

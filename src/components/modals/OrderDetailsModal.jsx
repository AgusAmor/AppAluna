/**
 * OrderDetailsModal.jsx
 * Displays full order details in read-only mode.
 * Shows: orderNumber, status, createdAt, customerInfo,
 * delivery, items, summary, and a collapsible status history.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, History, ChevronDown, ChevronUp } from "lucide-react-native";
import { useThemeColors, fonts } from "../../theme";
import { StatusBadge } from "../ui";
import {
  formatAddress,
  formatDeliveryInfo,
} from "../../utils/addressFormatter";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
} from "../../utils/formatters";

/**
 * OrderDetailsModal
 * @param {boolean} visible - Controls modal visibility
 * @param {function} onClose - Close handler
 * @param {object} order - Order data object
 */
const OrderDetailsModal = ({ visible, onClose, order }) => {
  const { colorScheme } = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colorScheme);
  const [showHistory, setShowHistory] = useState(false);

  if (!order) return null;

  const deliveryInfo = formatDeliveryInfo(order.delivery);

  const getActorLabel = (updatedBy) => {
    if (!updatedBy || updatedBy === "system") return "Sistema";
    if (updatedBy === order.userId) return "Cliente";
    return "Administrador";
  };

  const sortedHistory = order.statusHistory
    ? [...order.statusHistory].sort((a, b) => {
        const tA = a.timestamp?.toDate?.() || new Date(a.timestamp) || 0;
        const tB = b.timestamp?.toDate?.() || new Date(b.timestamp) || 0;
        return tB - tA;
      })
    : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          { paddingTop: Platform.OS === "ios" ? insets.top : 0 },
        ]}
      >
        <View
          style={[
            styles.sheet,
            { paddingBottom: Platform.OS === "ios" ? insets.bottom : 20 },
          ]}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.orderNumber}>
                #{order.orderNumber || order.id}
              </Text>
              <StatusBadge status={order.status} size="medium" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={colorScheme.textLight} />
            </TouchableOpacity>
          </View>

          {/* ── Scrollable body ── */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Order date */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Fecha del Pedido</Text>
              <Text style={styles.sectionValue}>
                {formatDateTime(order.createdAt)}
              </Text>
            </View>

            {/* ── Customer ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Cliente</Text>
              <Text style={styles.sectionValue}>
                {order.customerInfo?.name || "-"}
              </Text>
              {order.customerInfo?.email ? (
                <Text style={styles.sectionSubValue}>
                  {order.customerInfo.email}
                </Text>
              ) : null}
              {order.customerInfo?.phone ? (
                <Text style={styles.sectionSubValue}>
                  {order.customerInfo.phone}
                </Text>
              ) : null}
            </View>

            {/* ── Delivery ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Entrega</Text>
              {deliveryInfo ? (
                <>
                  <Text style={styles.sectionValue}>
                    {deliveryInfo.displayType}
                  </Text>
                  {deliveryInfo.address && (
                    <Text style={styles.sectionSubValue}>
                      {deliveryInfo.address}
                    </Text>
                  )}
                  {order.delivery?.shippingAddress?.recipientName ? (
                    <Text style={styles.sectionSubValue}>
                      {order.delivery.shippingAddress.recipientName}
                    </Text>
                  ) : null}
                  {order.delivery?.shippingAddress?.recipientPhone ? (
                    <Text style={styles.sectionSubValue}>
                      {order.delivery.shippingAddress.recipientPhone}
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.sectionValue}>-</Text>
              )}
            </View>

            {/* ── Items ── */}
            {order.items && order.items.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  Items ({order.items.length})
                </Text>
                {order.items.map((item, index) => {
                  const unitPrice = item.unitPrice ?? item.price ?? null;
                  const qty = item.quantity || 1;
                  return (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.productName || item.name || "Producto"}
                        {item.size ? (
                          <Text style={styles.itemDetail}> · {item.size}</Text>
                        ) : null}
                      </Text>
                      <View style={styles.itemRight}>
                        <Text style={styles.itemPrice}>
                          {unitPrice != null ? formatCurrency(unitPrice) : "-"}
                        </Text>
                        <Text style={styles.itemQty}>x{qty}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ── Summary ── */}
            {order.summary && (
              <View style={[styles.section, styles.summarySection]}>
                <Text style={styles.sectionLabel}>Resumen</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryRowLabel}>Productos</Text>
                  <Text style={styles.summaryRowValue}>
                    {formatCurrency(order.summary.subtotal ?? 0)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryRowLabel}>Envío</Text>
                  <Text style={styles.summaryRowValue}>
                    {order.summary.shipping != null &&
                    order.summary.shipping > 0
                      ? formatCurrency(order.summary.shipping)
                      : "Sin cargo"}
                  </Text>
                </View>

                {order.summary.discount != null &&
                  order.summary.discount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryRowLabel}>Descuento</Text>
                      <Text
                        style={[styles.summaryRowValue, styles.discountValue]}
                      >
                        -{formatCurrency(order.summary.discount)}
                      </Text>
                    </View>
                  )}

                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(order.summary.total || 0)}
                  </Text>
                </View>
              </View>
            )}

            {/* ── Status history ── */}
            {sortedHistory.length > 0 && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.historyToggle}
                  onPress={() => setShowHistory((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <View style={styles.historyToggleLeft}>
                    <History size={16} color={colorScheme.primary} />
                    <Text style={styles.historyToggleText}>
                      Historial del pedido ({sortedHistory.length})
                    </Text>
                  </View>
                  {showHistory ? (
                    <ChevronUp size={18} color={colorScheme.textLight} />
                  ) : (
                    <ChevronDown size={18} color={colorScheme.textLight} />
                  )}
                </TouchableOpacity>

                {showHistory && (
                  <View style={styles.historyList}>
                    {sortedHistory.map((entry, index) => (
                      <View key={index} style={styles.historyEntry}>
                        <View style={styles.historyEntryHeader}>
                          <StatusBadge status={entry.status} size="small" />
                          <Text style={styles.historyDate}>
                            {formatDateTime(entry.timestamp)}
                          </Text>
                        </View>
                        {entry.note ? (
                          <Text style={styles.historyNote}>{entry.note}</Text>
                        ) : null}
                        <Text style={styles.historyActor}>
                          {getActorLabel(entry.updatedBy)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colorScheme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 0,
      height: "85%",
      shadowColor: colorScheme.primary,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.border + "30",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    orderNumber: {
      ...fonts.heading.h3,
      color: colorScheme.text,
      fontWeight: "700",
    },
    closeBtn: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },

    // ── body ──
    body: {
      flex: 1,
    },
    bodyContent: {
      paddingBottom: 8,
      gap: 4,
    },

    // ── generic section ──
    section: {
      marginBottom: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.border + "40",
    },
    sectionLabel: {
      ...fonts.body.sm,
      color: colorScheme.primary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontWeight: "600",
      marginBottom: 6,
    },
    sectionValue: {
      ...fonts.body.base,
      color: colorScheme.text,
      fontWeight: "500",
      lineHeight: 20,
    },
    sectionSubValue: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      lineHeight: 18,
      marginTop: 2,
    },

    // ── items ──
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 5,
      paddingHorizontal: 10,
      backgroundColor: colorScheme.backgroundLight,
      borderRadius: 8,
      marginBottom: 4,
    },
    itemRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexShrink: 0,
    },
    itemName: {
      ...fonts.body.sm,
      color: colorScheme.text,
      fontWeight: "500",
      flex: 1,
      marginRight: 8,
    },
    itemDetail: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      fontWeight: "400",
    },
    itemQty: {
      ...fonts.body.xs,
      color: colorScheme.textLight,
      fontWeight: "600",
    },
    itemPrice: {
      ...fonts.body.sm,
      color: colorScheme.accent,
      fontWeight: "600",
    },

    // ── summary ──
    summarySection: {
      backgroundColor: colorScheme.backgroundLight,
      borderRadius: 10,
      padding: 12,
      borderBottomWidth: 0,
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 4,
    },
    summaryRowLabel: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
    },
    summaryRowValue: {
      ...fonts.body.sm,
      color: colorScheme.text,
      fontWeight: "500",
    },
    discountValue: {
      color: colorScheme.success,
    },
    totalRow: {
      marginTop: 6,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colorScheme.border + "60",
    },
    totalLabel: {
      ...fonts.body.base,
      color: colorScheme.accent,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    totalValue: {
      ...fonts.heading.h3,
      color: colorScheme.accent,
      fontWeight: "700",
    },

    // ── history ──
    historyToggle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colorScheme.backgroundLight,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colorScheme.border + "60",
    },
    historyToggleLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    historyToggleText: {
      ...fonts.body.sm,
      color: colorScheme.primary,
      fontWeight: "600",
    },
    historyList: {
      marginTop: 10,
      gap: 8,
    },
    historyEntry: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: colorScheme.backgroundLight,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: colorScheme.primary,
    },
    historyEntryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    historyDate: {
      ...fonts.body.xs,
      color: colorScheme.textLight,
    },
    historyNote: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      lineHeight: 18,
    },
    historyActor: {
      ...fonts.body.xs,
      color: colorScheme.primary,
      fontWeight: "600",
      fontStyle: "italic",
      marginTop: 4,
    },

    // ── footer ──
    footer: {
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colorScheme.border + "30",
      paddingBottom: 6,
    },
    closeButton: {
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colorScheme.border,
      alignItems: "center",
      backgroundColor: colorScheme.backgroundLight,
    },
    closeButtonText: {
      ...fonts.button,
      color: colorScheme.text,
      fontWeight: "600",
    },
  });

export default OrderDetailsModal;

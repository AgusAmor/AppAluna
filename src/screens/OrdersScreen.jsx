import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import { StatusBadge, Select } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useThemeColors, fonts } from "../theme";
import { useOrdersList } from "../hooks/screens";
import {
  useOrdersFilter,
  ORDER_STATUS_FILTERS,
  STATUS_SORTS,
  DELIVERY_METHOD_FILTERS,
} from "../hooks/screens";
import { useProductsList } from "../hooks/screens";
import { formatDateTime } from "../services/orders";
import { getStatusColor } from "../utils/statusColors";

const OrdersScreen = () => {
  const { user } = useAuth();
  const { colorScheme } = useThemeColors();
  const { filteredOrders: allOrders, loading, error } = useOrdersList();
  const { products } = useProductsList();
  const {
    filteredOrders,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    statusSort,
    setStatusSort,
    selectedProductId,
    setSelectedProductId,
    showFinalized,
    setShowFinalized,
    selectedDeliveryMethod,
    setSelectedDeliveryMethod,
  } = useOrdersFilter(allOrders);
  const styles = createStyles(colorScheme);

  // Status Filter Options
  const statusOptions = useMemo(() => {
    return [
      { label: "Estado", value: ORDER_STATUS_FILTERS.ALL },
      { label: "Pendiente", value: ORDER_STATUS_FILTERS.PENDING },
      { label: "Confirmado", value: ORDER_STATUS_FILTERS.CONFIRMED },
      { label: "Imprimiendo", value: ORDER_STATUS_FILTERS.PRINTING },
      { label: "Despachado", value: ORDER_STATUS_FILTERS.DISPATCHED },
      { label: "Entregado", value: ORDER_STATUS_FILTERS.DELIVERED },
      { label: "Retirado", value: ORDER_STATUS_FILTERS.WITHDRAWN },
      { label: "Cancelado", value: ORDER_STATUS_FILTERS.CANCELLED },
    ];
  }, []);

  // Status Color Map for Select styling
  const statusColorMap = useMemo(() => {
    return {
      [ORDER_STATUS_FILTERS.PENDING]: getStatusColor("pending"),
      [ORDER_STATUS_FILTERS.CONFIRMED]: getStatusColor("confirmed"),
      [ORDER_STATUS_FILTERS.PRINTING]: getStatusColor("printing"),
      [ORDER_STATUS_FILTERS.DISPATCHED]: getStatusColor("dispatched"),
      [ORDER_STATUS_FILTERS.DELIVERED]: getStatusColor("delivered"),
      [ORDER_STATUS_FILTERS.WITHDRAWN]: getStatusColor("withdrawn"),
      [ORDER_STATUS_FILTERS.CANCELLED]: getStatusColor("cancelled"),
    };
  }, []);

  // Product Filter Options
  const productOptions = useMemo(() => {
    const baseOptions = [{ label: "Producto", value: null }];
    if (products && products.length > 0) {
      const productOpts = products.map((product) => ({
        label: product.name,
        value: product.id,
      }));
      return [...baseOptions, ...productOpts];
    }
    return baseOptions;
  }, [products]);

  // Delivery Method Filter Options
  const deliveryMethodOptions = useMemo(() => {
    return [
      { label: "Entrega", value: DELIVERY_METHOD_FILTERS.ALL },
      { label: "Envío", value: DELIVERY_METHOD_FILTERS.ENVIO },
      { label: "Retiro", value: DELIVERY_METHOD_FILTERS.RETIRO },
    ];
  }, []);

  const renderOrderItem = ({ item }) => {
    return (
      <View style={styles.orderCard}>
        {/* Header: Order Number and Status */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>{item.orderNumber || item.id}</Text>
          <StatusBadge status={item.status} size="medium" />
        </View>

        {/* Customer and Email in same row */}
        <View style={styles.orderDetails}>
          <View style={styles.nameEmailRow}>
            <View style={styles.nameColumn}>
              <Text style={styles.label}>Cliente</Text>
              <Text style={styles.value}>
                {item.customerInfo?.name || "No especificado"}
              </Text>
            </View>
            <View style={styles.emailColumn}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value} numberOfLines={2}>
                {item.customerInfo?.email || "No especificado"}
              </Text>
            </View>
          </View>

          {/* Delivery Info */}
          {item.delivery && (
            <View style={styles.deliverySection}>
              {item.delivery.method === "pickup" ? (
                <>
                  <Text style={[styles.label, { marginTop: 8 }]}>
                    Tipo de Entrega
                  </Text>
                  <Text style={styles.value}>Retiro en Local</Text>
                </>
              ) : (
                (() => {
                  // For delivery methods other than pickup, show address
                  const address = item.delivery?.shippingAddress;

                  if (address) {
                    let addressText = "";
                    if (typeof address === "string") {
                      addressText = address;
                    } else if (typeof address === "object") {
                      // Format: street number, region · city
                      const streetNumber = [address.street, address.number]
                        .filter(Boolean)
                        .join(" ");
                      const regionCity = [address.region, address.city]
                        .filter(Boolean)
                        .join(" · ");
                      addressText = [streetNumber, regionCity]
                        .filter(Boolean)
                        .join(", ");
                    }

                    if (addressText) {
                      return (
                        <>
                          <Text style={[styles.label, { marginTop: 8 }]}>
                            Dirección de Entrega
                          </Text>
                          <Text style={styles.value}>{addressText}</Text>
                        </>
                      );
                    }
                  }
                  return null;
                })()
              )}
            </View>
          )}
        </View>

        {/* Items List */}
        {item.items && item.items.length > 0 && (
          <View style={styles.itemsList}>
            <Text style={styles.itemsLabel}>Items ({item.items.length})</Text>
            {item.items.map((itemDetail, index) => (
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
            ${(item.summary?.total || 0).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Sin pedidos</Text>
      <Text style={styles.emptyText}>No hay pedidos para esta búsqueda</Text>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Pedidos</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {/* Search and Filter Controls */}
      {!loading && (
        <View style={styles.filtersSection}>
          <Text style={styles.totalOrders}>
            Total: {filteredOrders.length} Pedidos
          </Text>

          {/* Search Input and Finalized Orders Toggle Row */}
          <View style={styles.searchRow}>
            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por texto"
              placeholderTextColor={colorScheme.textLight}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            {/* Show Finalized Orders Toggle */}
            <TouchableOpacity
              style={styles.checkboxContainerInline}
              onPress={() => setShowFinalized(!showFinalized)}
            >
              {showFinalized ? (
                <Eye size={20} color={colorScheme.accent} strokeWidth={2} />
              ) : (
                <EyeOff size={20} color={colorScheme.border} strokeWidth={2} />
              )}
              <Text style={styles.checkboxLabel}>finalizados</Text>
            </TouchableOpacity>
          </View>

          {/* Filters Row: Status, Delivery Method and Product */}
          <View style={styles.selectsRow}>
            {/* Status Filter Select */}
            <View style={styles.selectColumnWide}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                colorScheme={colorScheme}
                valueColorMap={statusColorMap}
              />
            </View>

            {/* Delivery Method Filter Select */}
            <View style={styles.selectColumn}>
              <Select
                value={selectedDeliveryMethod}
                onChange={setSelectedDeliveryMethod}
                options={deliveryMethodOptions}
                placeholder="Método de entrega"
                colorScheme={colorScheme}
              />
            </View>

            {/* Product Filter Select */}
            <View style={styles.selectColumn}>
              <Select
                value={selectedProductId}
                onChange={setSelectedProductId}
                options={productOptions}
                colorScheme={colorScheme}
              />
            </View>
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorScheme.primary} />
          <Text style={styles.loadingText}>Cargando pedidos...</Text>
        </View>
      )}
      {!loading && (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
        />
      )}
    </ScreenContainer>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    header: {
      marginTop: 20,
      marginBottom: 2,
    },
    title: {
      ...fonts.heading.h1,
      color: colorScheme.text,
      marginBottom: 4,
    },
    totalOrders: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 8,
      textAlign: "right",
    },
    errorContainer: {
      backgroundColor: `${colorScheme.error}20`,
      borderColor: colorScheme.error,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      ...fonts.body.base,
      color: colorScheme.error,
    },
    filtersSection: {
      marginBottom: 12,
      gap: 2,
    },
    searchRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      marginBottom: 8,
    },
    searchInput: {
      ...fonts.body.base,
      backgroundColor: colorScheme.backgroundLight2,
      borderColor: colorScheme.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colorScheme.text,
      flex: 1,
    },
    selectsRow: {
      flexDirection: "row",
      gap: 6,
      marginBottom: 8,
    },
    selectColumn: {
      flex: 1,
    },
    selectColumnWide: {
      flex: 1.2,
    },
    checkboxContainer: {
      padding: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxContainerInline: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 2,
      paddingVertical: 8,
    },
    checkboxLabel: {
      ...fonts.body.sm,
      color: colorScheme.text,
      fontWeight: "500",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginTop: 12,
    },
    listContent: {
      paddingBottom: 65,
      gap: 12,
    },
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
      marginBottom: 8,
    },
    orderNumber: {
      ...fonts.heading.h4,
      color: colorScheme.primaryDark,
      flex: 1,
    },
    orderDetails: {
      marginBottom: 0,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.border,
      paddingBottom: 8,
    },
    nameEmailRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 0,
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
      marginBottom: 2,
      lineHeight: 17,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyTitle: {
      ...fonts.heading.h4,
      color: colorScheme.text,
      marginBottom: 8,
    },
    emptyText: {
      ...fonts.body.base,
      color: colorScheme.textLight,
    },
  });

export default OrdersScreen;

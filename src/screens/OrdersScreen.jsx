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
import ScreenContainer from "../components/ui/ScreenContainer";
import { StatusBadge, Select } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useThemeColors, fonts } from "../theme";
import { useOrdersList } from "../hooks/screens";
import {
  useOrdersFilter,
  ORDER_STATUS_FILTERS,
  STATUS_SORTS,
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
  } = useOrdersFilter(allOrders);
  const styles = createStyles(colorScheme);

  // Status Filter Options
  const statusOptions = useMemo(() => {
    return [
      { label: "Todos los estados", value: ORDER_STATUS_FILTERS.ALL },
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
    const baseOptions = [{ label: "Todos los productos", value: null }];
    if (products && products.length > 0) {
      const productOpts = products.map((product) => ({
        label: product.name,
        value: product.id,
      }));
      return [...baseOptions, ...productOpts];
    }
    return baseOptions;
  }, [products]);

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
              {item.delivery.method && (
                <>
                  <Text style={[styles.label, { marginTop: 8 }]}>
                    Tipo de Entrega
                  </Text>
                  <Text style={styles.value}>
                    {item.delivery.method === "pickup"
                      ? "Retiro en Local"
                      : item.delivery.method}
                  </Text>
                </>
              )}
              {item.delivery.cost !== undefined && (
                <>
                  <Text style={[styles.label, { marginTop: 8 }]}>
                    Costo de Entrega
                  </Text>
                  <Text style={styles.value}>
                    ${item.delivery.cost.toFixed(2)}
                  </Text>
                </>
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
                • {itemDetail.productName} x{itemDetail.quantity}
              </Text>
            ))}
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={[styles.label, { marginTop: 12 }]}>Total</Text>
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
          {/* Search Input */}
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, email o nro. orden"
            placeholderTextColor={colorScheme.textLight}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          {/* Status and Product Filters Row */}
          <View style={styles.selectsRow}>
            {/* Status Filter Select */}
            <View style={styles.selectColumn}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Selecciona un estado"
                colorScheme={colorScheme}
                valueColorMap={statusColorMap}
              />
            </View>

            {/* Product Filter Select */}
            <View style={styles.selectColumn}>
              <Select
                value={selectedProductId}
                onChange={setSelectedProductId}
                options={productOptions}
                placeholder="Selecciona un producto"
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
    searchInput: {
      ...fonts.body.base,
      backgroundColor: colorScheme.backgroundLight2,
      borderColor: colorScheme.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colorScheme.text,
      marginBottom: 8,
    },
    selectsRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 8,
    },
    selectColumn: {
      flex: 1,
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
      padding: 12,
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
      ...fonts.heading.h4,
      color: colorScheme.text,
      flex: 1,
    },
    orderDetails: {
      marginBottom: 12,
    },
    nameEmailRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 0,
    },
    nameColumn: {
      flex: 1,
    },
    emailColumn: {
      flex: 1,
    },
    deliverySection: {
      marginTop: 8,
    },
    totalSection: {
      borderTopWidth: 1,
      borderTopColor: colorScheme.border,
      paddingTop: 12,
      marginTop: 12,
    },
    label: {
      ...fonts.body.xs,
      color: colorScheme.textLight,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 2,
      fontWeight: "600",
    },
    value: {
      ...fonts.body.sm,
      color: colorScheme.text,
    },
    totalValue: {
      ...fonts.heading.h4,
      color: colorScheme.primary,
    },
    itemsList: {
      marginTop: 12,
    },
    itemsLabel: {
      ...fonts.body.xs,
      color: colorScheme.textLight,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 6,
      fontWeight: "600",
    },
    itemText: {
      ...fonts.body.sm,
      color: colorScheme.text,
      marginBottom: 4,
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

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
import { Select } from "../components/ui";
import { OrderCard } from "../components/orders";
import { OrderDetailsModal } from "../components/modals";
import { useAuth } from "../context/AuthContext";
import { useThemeColors, fonts } from "../theme";
import { useOrdersList } from "../hooks/screens";
import {
  useOrdersFilter,
  STATUS_SORTS,
  DELIVERY_METHOD_FILTERS,
  useOrdersFilterOptions,
} from "../hooks/screens";
import { useProductsList } from "../hooks/screens";
import { getStatusColor } from "../utils/statusColors";

const OrdersScreen = () => {
  const { user } = useAuth();
  const { colorScheme } = useThemeColors();
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);

  const handleOpenDetails = React.useCallback((order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  }, []);

  const handleCloseDetails = React.useCallback(() => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  }, []);
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
    selectedProductName,
    setSelectedProductName,
    showFinalized,
    setShowFinalized,
    selectedDeliveryMethod,
    setSelectedDeliveryMethod,
  } = useOrdersFilter(allOrders);

  // Get filter options from custom hook
  const {
    statusOptions,
    statusColorMap,
    productOptions,
    deliveryMethodOptions,
  } = useOrdersFilterOptions(products);

  const styles = createStyles(colorScheme);

  const renderOrderItem = ({ item }) => {
    return (
      <OrderCard
        order={item}
        colorScheme={colorScheme}
        onPress={() => handleOpenDetails(item)}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Sin pedidos</Text>
      <Text style={styles.emptyText}>No hay pedidos para esta búsqueda</Text>
    </View>
  );

  return (
    <>
      <OrderDetailsModal
        visible={showDetailsModal}
        onClose={handleCloseDetails}
        order={selectedOrder}
        onOrderUpdated={(updatedOrder) => setSelectedOrder(updatedOrder)}
      />
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
                  <EyeOff
                    size={20}
                    color={colorScheme.border}
                    strokeWidth={2}
                  />
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
                  value={selectedProductName}
                  onChange={setSelectedProductName}
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
    </>
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

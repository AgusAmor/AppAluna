import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import {
  useProductsList,
  useProductEdit,
  useProductsFilter,
  FAMILY_FILTERS,
  PRICE_SORTS,
} from "../hooks/screens";
import { ProductEditModal } from "../components/modals";
import { useThemeColors, fonts } from "../theme";

const ProductsScreen = () => {
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  const { filteredProducts: allProducts, loading, error } = useProductsList();
  const {
    filteredProducts,
    familyFilter,
    setFamilyFilter,
    priceSort,
    setPriceSort,
  } = useProductsFilter(allProducts);
  const {
    editForm,
    setEditForm,
    showEditModal,
    openEditModal,
    closeEditModal,
    isSaving,
    handleSaveProduct,
    handleDeleteProduct,
    selectedProduct,
    imagePreview,
    setImagePreview,
    handleTakePhoto,
    handlePickFromGallery,
    handleRemoveImage,
    isPickingImage,
  } = useProductEdit();

  /**
   * Format price for display
   */
  const formatPrice = useCallback((price) => {
    try {
      if (!price) return "-";
      return `$${parseFloat(price).toFixed(2)}`;
    } catch {
      return "-";
    }
  }, []);

  /**
   * Render product item
   */
  const renderProductItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => openEditModal(item)}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productImage, styles.productImagePlaceholder]}>
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name || "Sin nombre"}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.productMeta}>
            <View>
              <Text style={styles.productLabel}>Familia</Text>
              <Text style={styles.productValue}>{item.family || "-"}</Text>
            </View>
            <View>
              <Text style={styles.productLabel}>Normal</Text>
              <Text style={styles.productPrice}>
                {formatPrice(item.pricing?.normal?.price)}
              </Text>
            </View>
            <View>
              <Text style={styles.productLabel}>Small</Text>
              <Text style={styles.productPrice}>
                {formatPrice(item.pricing?.small?.price)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [formatPrice, openEditModal],
  );

  const handleAddProduct = useCallback(() => {
    openEditModal({});
  }, [openEditModal]);

  // Loading state
  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator size="large" color={colorScheme.primary} />
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer>
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Productos</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Filter Controls */}
        <View style={styles.filterContainer}>
          <Text style={styles.totalProducts}>
            Total: {filteredProducts.length} productos
          </Text>
        </View>

        {/* Price Sort Buttons */}
        <View style={styles.priceFilterContainer}>
          <TouchableOpacity
            style={[
              styles.priceFilterButton,
              priceSort === PRICE_SORTS.ASC && styles.priceFilterButtonActive,
            ]}
            onPress={() =>
              setPriceSort(
                priceSort === PRICE_SORTS.ASC
                  ? PRICE_SORTS.NONE
                  : PRICE_SORTS.ASC,
              )
            }
          >
            <Text
              style={[
                styles.priceFilterButtonText,
                priceSort === PRICE_SORTS.ASC &&
                  styles.priceFilterButtonTextActive,
              ]}
            >
              Menor a Mayor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.priceFilterButton,
              priceSort === PRICE_SORTS.DESC && styles.priceFilterButtonActive,
            ]}
            onPress={() =>
              setPriceSort(
                priceSort === PRICE_SORTS.DESC
                  ? PRICE_SORTS.NONE
                  : PRICE_SORTS.DESC,
              )
            }
          >
            <Text
              style={[
                styles.priceFilterButtonText,
                priceSort === PRICE_SORTS.DESC &&
                  styles.priceFilterButtonTextActive,
              ]}
            >
              Mayor a Menor
            </Text>
          </TouchableOpacity>
        </View>

        {/* Family Filter Buttons */}
        <View style={styles.statusFilterContainer}>
          <TouchableOpacity
            style={[
              styles.statusFilterButton,
              familyFilter === FAMILY_FILTERS.ALL &&
                styles.statusFilterButtonActive,
            ]}
            onPress={() => setFamilyFilter(FAMILY_FILTERS.ALL)}
          >
            <Text
              style={[
                styles.statusFilterButtonText,
                familyFilter === FAMILY_FILTERS.ALL &&
                  styles.statusFilterButtonTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusFilterButton,
              familyFilter === FAMILY_FILTERS.AENOR &&
                styles.statusFilterButtonActive,
            ]}
            onPress={() => setFamilyFilter(FAMILY_FILTERS.AENOR)}
          >
            <Text
              style={[
                styles.statusFilterButtonText,
                familyFilter === FAMILY_FILTERS.AENOR &&
                  styles.statusFilterButtonTextActive,
              ]}
            >
              AENOR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusFilterButton,
              familyFilter === FAMILY_FILTERS.CORE &&
                styles.statusFilterButtonActive,
            ]}
            onPress={() => setFamilyFilter(FAMILY_FILTERS.CORE)}
          >
            <Text
              style={[
                styles.statusFilterButtonText,
                familyFilter === FAMILY_FILTERS.CORE &&
                  styles.statusFilterButtonTextActive,
              ]}
            >
              CORE
            </Text>
          </TouchableOpacity>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay productos</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productsList}
            style={styles.flatList}
            scrollEnabled={true}
            removeClippedSubviews={true}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={50}
          />
        )}
      </ScreenContainer>

      <ProductEditModal
        visible={showEditModal}
        onClose={closeEditModal}
        product={selectedProduct}
        editForm={editForm}
        onFormChange={setEditForm}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        isSaving={isSaving}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        onTakePhoto={handleTakePhoto}
        onPickFromGallery={handlePickFromGallery}
        onRemoveImage={handleRemoveImage}
        isPickingImage={isPickingImage}
      />

      <TouchableOpacity
        style={styles.addProductButton}
        onPress={handleAddProduct}
      >
        <Text style={styles.addProductButtonText}>+ Agregar Producto</Text>
      </TouchableOpacity>
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
    errorBox: {
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
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      ...fonts.body.base,
      color: colorScheme.textLight,
    },
    flatList: {
      flex: 1,
    },
    productsList: {
      gap: 12,
      paddingBottom: 65,
    },
    productCard: {
      backgroundColor: colorScheme.backgroundLight2,
      borderRadius: 8,
      overflow: "hidden",
      borderLeftWidth: 4,
      borderLeftColor: colorScheme.primary,
    },
    productImage: {
      width: "100%",
      height: 150,
      backgroundColor: colorScheme.backgroundLight,
    },
    productImagePlaceholder: {
      justifyContent: "center",
      alignItems: "center",
    },
    placeholderText: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
    },
    productInfo: {
      padding: 12,
    },
    productName: {
      ...fonts.heading.h4,
      color: colorScheme.text,
      marginBottom: 4,
    },
    productDescription: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 8,
      height: 36,
    },
    productMeta: {
      flexDirection: "row",
      justifyContent: "space-around",
      gap: 8,
    },
    productLabel: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 2,
    },
    productValue: {
      ...fonts.body.base,
      color: colorScheme.text,
      fontWeight: "600",
    },
    productPrice: {
      ...fonts.heading.h4,
      color: colorScheme.accent,
      fontWeight: "600",
    },
    filterContainer: {
      marginBottom: 2,
    },
    totalProducts: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 8,
      textAlign: "right",
    },
    statusFilterContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
      justifyContent: "space-between",
    },
    statusFilterButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colorScheme.backgroundLight2,
      borderWidth: 1,
      borderColor: colorScheme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    statusFilterButtonActive: {
      backgroundColor: colorScheme.primary,
      borderColor: colorScheme.primary,
    },
    statusFilterButtonText: {
      ...fonts.body.sm,
      color: colorScheme.text,
      fontWeight: "500",
    },
    statusFilterButtonTextActive: {
      color: colorScheme.background,
      fontWeight: "600",
    },
    priceFilterContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 8,
      justifyContent: "space-between",
    },
    priceFilterButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colorScheme.backgroundLight2,
      borderWidth: 1,
      borderColor: colorScheme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    priceFilterButtonActive: {
      backgroundColor: colorScheme.accent,
      borderColor: colorScheme.accent,
    },
    priceFilterButtonText: {
      ...fonts.body.sm,
      color: colorScheme.text,
      fontWeight: "500",
    },
    priceFilterButtonTextActive: {
      color: colorScheme.background,
      fontWeight: "600",
    },
    addProductButton: {
      position: "absolute",
      bottom: 10,
      left: "15%",
      backgroundColor: colorScheme.accent,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
      alignItems: "center",
      zIndex: 100,
      width: "70%",
      alignSelf: "center",
    },
    addProductButtonText: {
      ...fonts.heading.h4,
      color: colorScheme.background,
      fontWeight: "600",
    },
  });

export default ProductsScreen;

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
import { useProductsList, useProductEdit } from "../hooks/screens";
import { ProductEditModal } from "../components/modals";
import { useThemeColors, fonts } from "../theme";

const ProductsScreen = () => {
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  const { filteredProducts, loading, error } = useProductsList();
  const {
    editForm,
    setEditForm,
    showEditModal,
    openEditModal,
    closeEditModal,
    isSaving,
    handleSaveProduct,
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
          <Text style={styles.subtitle}>
            Total: {filteredProducts.length} productos
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
        isSaving={isSaving}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        onTakePhoto={handleTakePhoto}
        onPickFromGallery={handlePickFromGallery}
        onRemoveImage={handleRemoveImage}
        isPickingImage={isPickingImage}
      />
    </>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    header: {
      marginTop: 20,
      marginBottom: 32,
    },
    title: {
      ...fonts.heading.h1,
      color: colorScheme.text,
      marginBottom: 4,
    },
    subtitle: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 2,
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
    productsList: {
      gap: 12,
      paddingBottom: 20,
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
  });

export default ProductsScreen;

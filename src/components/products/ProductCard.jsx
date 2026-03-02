/**
 * ProductCard Component
 * Displays a single product with image, name, family, and pricing
 */

import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { formatPrice } from "../../utils/formatters";
import { fonts } from "../../theme";

/**
 * ProductCard
 * @param {object} product - Product data object
 * @param {function} onPress - Callback when card is pressed
 * @param {object} colorScheme - Theme color scheme
 * @returns {JSX.Element}
 */
const ProductCard = ({ product, onPress, colorScheme }) => {
  const styles = createStyles(colorScheme);

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      {/* Product Image */}
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.productImage, styles.productImagePlaceholder]}>
          <Text style={styles.placeholderText}>Sin imagen</Text>
        </View>
      )}

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name || "Sin nombre"}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>

        {/* Product Meta: Family and Prices */}
        <View style={styles.productMeta}>
          <View>
            <Text style={styles.productLabel}>Familia</Text>
            <Text style={styles.productValue}>{product.family || "-"}</Text>
          </View>
          <View>
            <Text style={styles.productLabel}>Normal</Text>
            <Text style={styles.productPrice}>
              {formatPrice(product.pricing?.normal?.price)}
            </Text>
          </View>
          <View>
            <Text style={styles.productLabel}>Small</Text>
            <Text style={styles.productPrice}>
              {formatPrice(product.pricing?.small?.price)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    productCard: {
      backgroundColor: colorScheme.backgroundLight2,
      borderRadius: 8,
      overflow: "hidden",
      borderLeftWidth: 4,
      borderLeftColor: colorScheme.primary,
    },
    productImage: {
      width: "100%",
      height: 120,
      backgroundColor: colorScheme.border,
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
      gap: 8,
    },
    productName: {
      ...fonts.heading.h3,
      color: colorScheme.text,
    },
    productDescription: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 4,
    },
    productMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      marginTop: 4,
    },
    productLabel: {
      ...fonts.body.xs,
      color: colorScheme.textLight,
      marginBottom: 2,
    },
    productValue: {
      ...fonts.body.sm,
      color: colorScheme.text,
    },
    productPrice: {
      fontFamily: "Comfortaa-Bold",
      fontSize: 20,
      color: colorScheme.accent,
    },
  });

export default ProductCard;

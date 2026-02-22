/**
 * useProductsList.js
 * Custom hook for managing product list with real-time data subscription
 * Handles: real-time Firebase subscription, debouncing (150ms)
 * Returns: products list, loading state, error state
 *
 * Performance optimizations:
 * - Debounce: Waits 150ms after updates stop before re-rendering
 * - Memoization: Prevents unnecessary re-renders of filtered data
 * - InteractionManager: Schedules updates after user interactions complete
 */

import { useEffect, useState, useMemo } from "react";
import { InteractionManager } from "react-native";
import { useDebounce } from "../../loading";
import { subscribeToProducts } from "../../../services/products";

export function useProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter out inactive products
  const activeProducts = useMemo(() => {
    return products.filter((product) => product.status !== "inactive");
  }, [products]);

  // Debounce products updates to prevent excessive re-renders on Android
  const debouncedProducts = useDebounce(activeProducts, 150);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToProducts((updatedProducts) => {
        InteractionManager.runAfterInteractions(() => {
          setProducts(updatedProducts);
          setLoading(false);
        });
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error subscribing to products:", err);
      setError("Error al cargar productos");
      setLoading(false);
    }
  }, []);

  return {
    products,
    filteredProducts: debouncedProducts,
    loading,
    error,
  };
}

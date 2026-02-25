/**
 * useOrdersList.js
 * Custom hook for managing orders list with real-time data subscription
 * Handles: real-time Firebase subscription, debouncing (150ms), sorting by date
 * Returns: orders list, debounced/sorted orders, loading state, error state
 *
 * Performance optimizations:
 * - Debounce: Waits 150ms after updates stop before re-rendering
 * - Memoization: Prevents unnecessary re-renders of sorted data
 * - InteractionManager: Schedules updates after user interactions complete
 * - Real-time polling: Updates every 3 seconds from Cloud Functions
 *
 * Usage:
 *  const { orders, filteredOrders, loading, error } = useOrdersList();
 */

import { useEffect, useState, useMemo } from "react";
import { InteractionManager } from "react-native";
import { useDebounce } from "../loading";
import { useAuth } from "../../context/AuthContext";
import { subscribeToOrders } from "../../services/orders";

export function useOrdersList() {
  const { user: authUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sort orders by creation date (newest first)
  const sortedOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    return [...orders].sort((a, b) => {
      const dateA =
        a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
      const dateB =
        b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
      return dateB - dateA; // Newest first
    });
  }, [orders]);

  // Debounce orders updates to prevent excessive re-renders on Android
  const debouncedOrders = useDebounce(sortedOrders, 150);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!authUser) {
      setError("Debe estar autenticado");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToOrders((updatedOrders) => {
        InteractionManager.runAfterInteractions(() => {
          setOrders(updatedOrders || []);
          setLoading(false);
        });
      }, authUser);

      return () => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      };
    } catch (err) {
      console.error("Error subscribing to orders:", err);
      setError("Error al cargar pedidos");
      setLoading(false);
    }
  }, [authUser]);

  return {
    orders,
    filteredOrders: debouncedOrders,
    loading,
    error,
  };
}

/**
 * useDashboardStats.js
 * Custom hook for real-time dashboard statistics
 *
 * Subscribes to real-time updates from:
 * - Products (via subscribeToProducts)
 * - Orders (via subscribeToOrders)
 * - Users (via subscribeToUsers)
 *
 * Calculates stats:
 * - totalProducts: Count of all products
 * - ordersToday: Orders created today
 * - registeredUsers: Count of all users
 * - monthlyRevenue: Sum of orders from current month
 *
 * Returns:
 * - stats: Object with all calculated metrics
 * - loading: Boolean indicating if data is being loaded
 * - error: Error message if any
 */

import { useState, useEffect } from "react";
import { InteractionManager } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { subscribeToUsers } from "../../services/users";
import { subscribeToOrders } from "../../services/orders";
import { subscribeToProducts } from "../../services/products";

export function useDashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    ordersToday: 0,
    registeredUsers: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store raw data from listeners
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // Calculate stats whenever data changes
  useEffect(() => {
    calculateStats(products, orders, users);
  }, [products, orders, users]);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribes = [];

    try {
      // Subscribe to products
      const unsubscribeProducts = subscribeToProducts((updatedProducts) => {
        InteractionManager.runAfterInteractions(() => {
          setProducts(updatedProducts);
        });
      });
      unsubscribes.push(unsubscribeProducts);

      // Subscribe to orders
      const unsubscribeOrders = subscribeToOrders((updatedOrders) => {
        InteractionManager.runAfterInteractions(() => {
          setOrders(updatedOrders);
        });
      });
      unsubscribes.push(unsubscribeOrders);

      // Subscribe to users
      const unsubscribeUsers = subscribeToUsers((updatedUsers) => {
        InteractionManager.runAfterInteractions(() => {
          setUsers(updatedUsers);
        });
      });
      unsubscribes.push(unsubscribeUsers);

      // Mark loading complete after first data is received
      setTimeout(() => setLoading(false), 500);
    } catch (err) {
      console.error("Error setting up dashboard stats listeners:", err);
      setError("Error al cargar estadísticas");
      setLoading(false);
    }

    // Cleanup unsubscribers when component unmounts
    return () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch (err) {
          console.error("Error unsubscribing:", err);
        }
      });
    };
  }, []);

  const calculateStats = (productsList, ordersList, usersList) => {
    try {
      // Calculate today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total products
      const totalProducts = productsList?.length || 0;

      // Orders today
      const ordersToday =
        ordersList?.filter((order) => {
          const orderDate = new Date(order.createdAt || order.created_at);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        }).length || 0;

      // Registered users
      const registeredUsers = usersList?.length || 0;

      // Monthly revenue - sum items from all orders in current month
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
      );

      let monthlyRevenue = 0;

      if (ordersList && Array.isArray(ordersList)) {
        ordersList.forEach((order) => {
          const orderDate = new Date(order.createdAt || order.created_at);

          // Check if order is within current month (from first day to today)
          if (orderDate >= firstDayOfMonth && orderDate <= new Date()) {
            // Sum total from all items in the order
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item) => {
                const itemPrice = item.unitPrice || item.price || 0;
                const quantity = item.quantity || 1;
                monthlyRevenue += itemPrice * quantity;
              });
            }
          }
        });
      }

      setStats({
        totalProducts,
        ordersToday,
        registeredUsers,
        monthlyRevenue,
      });
    } catch (err) {
      console.error("Error calculating stats:", err);
      setError("Error calculando estadísticas");
    }
  };

  return { stats, loading, error };
}

export default useDashboardStats;

/**
 * useDashboardStats.js
 * Custom hook for fetching and managing dashboard statistics
 *
 * Returns:
 * - stats: Object with totalProducts, ordersToday, registeredUsers, monthlyRevenue
 * - loading: Boolean indicating if data is being fetched
 * - error: Error message if any
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchUsers } from "../../services/firebase/firebaseUserService";
import { fetchAllOrders } from "../../services/firebase/firebaseOrderService";
import { fetchProducts } from "../../services/firebase/firebaseProductService";
import { auth } from "../../services/firebase/firebase";

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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token for API calls
      const token = await auth.currentUser?.getIdToken();

      // Fetch all data in parallel with error handling for each
      let users = [];
      let orders = [];
      let products = [];

      try {
        users = await fetchUsers(token);
      } catch (err) {
        console.error("Error fetching users:", err);
      }

      try {
        orders = await fetchAllOrders(token);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }

      try {
        products = await fetchProducts();
      } catch (err) {
        console.error("Error fetching products:", err);
      }

      // Calculate today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate statistics
      const totalProducts = products?.length || 0;

      const ordersToday =
        orders?.filter((order) => {
          const orderDate = new Date(order.createdAt || order.created_at);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        }).length || 0;

      const registeredUsers = users?.length || 0;

      const monthlyRevenue =
        orders?.reduce((total, order) => {
          const orderDate = new Date(order.createdAt || order.created_at);
          const currentDate = new Date();
          const isCurrentMonth =
            orderDate.getMonth() === currentDate.getMonth() &&
            orderDate.getFullYear() === currentDate.getFullYear();
          return isCurrentMonth ? total + (order.total || 0) : total;
        }, 0) || 0;

      setStats({
        totalProducts,
        ordersToday,
        registeredUsers,
        monthlyRevenue,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.message || "Error cargando estadísticas");
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error };
}

export default useDashboardStats;

/**
 * useUsersList.js
 * Custom hook for managing user list with real-time data subscription
 * Handles: real-time Firebase subscription, debouncing (150ms), filtering current user
 * Returns: users list, debounced/filtered users, loading state, error state
 *
 * Performance optimizations:
 * - Debounce: Waits 150ms after updates stop before re-rendering
 * - Memoization: Prevents unnecessary re-renders of filtered data
 * - InteractionManager: Schedules updates after user interactions complete
 * - Filters out the currently logged-in user from the list
 *
 * Note: Pagination is handled separately in UsersScreen to work correctly with filters
 */

import { useEffect, useState, useMemo } from "react";
import { InteractionManager } from "react-native";
import { useDebounce } from "../../loading";
import { useAuth } from "../../../context/AuthContext";
import { subscribeToUsers } from "../../../services/users";

export function useUsersList() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter out the current logged-in user and any admin users
  const filteredUsers = useMemo(() => {
    if (!authUser?.uid) return users;
    return users.filter(
      (user) => user.id !== authUser.uid && user.role !== "admin",
    );
  }, [users, authUser?.uid]);

  // Debounce users updates to prevent excessive re-renders on Android
  const debouncedUsers = useDebounce(filteredUsers, 150);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToUsers((updatedUsers) => {
        InteractionManager.runAfterInteractions(() => {
          setUsers(updatedUsers);
          setLoading(false);
        });
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error subscribing to users:", err);
      setError("Error al cargar usuarios");
      setLoading(false);
    }
  }, []);

  return {
    users,
    filteredUsers: debouncedUsers,
    loading,
    error,
  };
}

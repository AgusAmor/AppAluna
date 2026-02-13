/**
 * useUsersList.js
 * Custom hook for managing user list with real-time data subscription
 * Handles: real-time Firebase subscription, debouncing (150ms), pagination (20 items/page)
 * Returns: users list, memoized/paginated users, loading state, error state, pagination controls
 *
 * Performance optimizations:
 * - Debounce: Waits 150ms after updates stop before re-rendering
 * - Pagination: Loads only 20 items initially, loads more on scroll
 * - Memoization: Prevents unnecessary re-renders of paginated data
 * - InteractionManager: Schedules updates after user interactions complete
 */

import { useEffect, useState, useMemo } from "react";
import { InteractionManager } from "react-native";
import { useDebounce, usePagination } from "../../loading";
import { subscribeToUsers } from "../../../services/users";

export function useUsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce users updates to prevent excessive re-renders on Android
  const debouncedUsers = useDebounce(users, 150);

  // Pagination: load 20 users at a time
  const {
    visibleItems: paginatedUsers,
    loadMore,
    hasMore,
  } = usePagination(debouncedUsers, 20);

  // Memoize users list
  const memoizedUsers = useMemo(() => paginatedUsers, [paginatedUsers]);

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
    memoizedUsers,
    loading,
    error,
    loadMore,
    hasMore,
  };
}

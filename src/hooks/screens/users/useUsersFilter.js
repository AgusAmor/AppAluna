/**
 * useUsersFilter.js
 * Custom hook for managing user list filters
 * Handles: search by name/email, filter by account status
 * Returns: filtered users, search term, status filter, and setters
 */

import { useState, useMemo } from "react";

// Account status filter options
export const ACCOUNT_STATUS_FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  SUSPENDED: "suspended",
};

export function useUsersFilter(users) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(ACCOUNT_STATUS_FILTERS.ALL);

  // Filter users based on search term and status
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Apply search filter (name or email)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower);

      // Apply status filter
      const matchesStatus =
        statusFilter === ACCOUNT_STATUS_FILTERS.ALL ||
        user.accountStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  return {
    filteredUsers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
  };
}

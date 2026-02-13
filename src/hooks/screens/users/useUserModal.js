/**
 * useUserModal.js
 * Custom hook for managing user details modal state and selection
 * Handles: showing/hiding details modal, selecting/clearing user
 * Returns: selectedUser, showDetailsModal, openDetailsModal(), closeDetailsModal()
 */

import { useState, useCallback } from "react";

export function useUserModal() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const openDetailsModal = useCallback((userItem) => {
    setSelectedUser(userItem);
    setShowDetailsModal(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    // Clear selected user after animation
    setTimeout(() => setSelectedUser(null), 200);
  }, []);

  return {
    selectedUser,
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal,
  };
}

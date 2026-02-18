/**
 * useUserModal.js
 * Custom hook for managing user details modal state and selection
 *
 * Handles:
 * - Showing/hiding details modal
 * - Selecting/clearing user
 * - Tracking modal navigation flow (details to edit transitions)
 *
 * Returns:
 * - selectedUser: Currently selected user object
 * - showDetailsModal: Boolean for details modal visibility
 * - openDetailsModal(userItem): Open details modal with user data
 * - closeDetailsModal(): Close details modal
 * - setSelectedUserOnly(userItem): Set user without opening modal
 * - shouldReopenDetailsOnEditClose: Flag to reopen details after edit close
 * - setReopenDetailsFlag(): Mark details for reopening
 * - setShouldReopenDetailsOnEditClose(bool): Set reopen flag
 * - clearSelectedUser(): Clear user and reset flag
 */

import { useState, useCallback } from "react";

export function useUserModal() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [shouldReopenDetailsOnEditClose, setShouldReopenDetailsOnEditClose] =
    useState(false);

  const openDetailsModal = useCallback((userItem) => {
    setSelectedUser(userItem);
    setShowDetailsModal(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    // Only clear selected user if not reopening on edit close
    // The flag will be checked to decide if we should clear
  }, []);

  const setSelectedUserOnly = useCallback((userItem) => {
    setSelectedUser(userItem);
  }, []);

  const setReopenDetailsFlag = useCallback(() => {
    setShouldReopenDetailsOnEditClose(true);
  }, []);

  const clearSelectedUser = useCallback(() => {
    setShouldReopenDetailsOnEditClose(false);
    setSelectedUser(null);
  }, []);

  /**
   * Updates the selected user based on the provided user list
   * Used after saving changes to ensure modal displays latest data
   */
  const updateSelectedUserFromList = useCallback(
    (usersList) => {
      if (!selectedUser || !usersList) return;

      const updatedUser = usersList.find((u) => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    },
    [selectedUser],
  );

  return {
    selectedUser,
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal,
    setSelectedUserOnly,
    shouldReopenDetailsOnEditClose,
    setReopenDetailsFlag,
    setShouldReopenDetailsOnEditClose,
    clearSelectedUser,
    updateSelectedUserFromList,
  };
}

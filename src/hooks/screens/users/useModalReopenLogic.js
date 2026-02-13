/**
 * useModalReopenLogic.js
 * Custom hook for managing modal reopen behavior on close and save
 *
 * Handles:
 * - Reopening details modal after edit modal closes (if came from details)
 * - Reopening details modal after user save (if came from details)
 * - Clearing user selection when closing from list
 * - Platform-specific animation delays
 *
 * Returns:
 * - handleEditModalClose(selectedUser, shouldReopen): Close edit with conditional reopen
 * - handleSaveUserAndTransition(selectedUser, shouldReopen): Save and reopen details if needed
 * - handleDetailsModalClose(shouldReopen): Close details with conditional cleanup
 */

import { useCallback } from "react";
import { Platform } from "react-native";

const TRANSITION_DELAY_MS = 5;
const CLEANUP_DELAY_MS = 50;

export function useModalReopenLogic(
  closeEditModal,
  openDetailsModal,
  setShouldReopenDetailsOnEditClose,
  clearSelectedUser,
  closeDetailsModal,
) {
  /**
   * Handle edit modal close with conditional details reopening
   */
  const handleEditModalClose = useCallback(
    (selectedUser, shouldReopen) => {
      if (shouldReopen && selectedUser) {
        closeEditModal();
        if (Platform.OS === "ios") {
          setTimeout(() => {
            openDetailsModal(selectedUser);
            setShouldReopenDetailsOnEditClose(false);
          }, TRANSITION_DELAY_MS);
        } else {
          openDetailsModal(selectedUser);
          setShouldReopenDetailsOnEditClose(false);
        }
      } else {
        closeEditModal();
        clearSelectedUser();
      }
    },
    [
      closeEditModal,
      openDetailsModal,
      setShouldReopenDetailsOnEditClose,
      clearSelectedUser,
    ],
  );

  /**
   * Handle details modal close with conditional user cleanup
   */
  const handleDetailsModalClose = useCallback(
    (shouldReopen) => {
      closeDetailsModal();
      setTimeout(() => {
        if (!shouldReopen) {
          clearSelectedUser();
        }
      }, CLEANUP_DELAY_MS);
    },
    [closeDetailsModal, clearSelectedUser],
  );

  return {
    handleEditModalClose,
    handleDetailsModalClose,
  };
}

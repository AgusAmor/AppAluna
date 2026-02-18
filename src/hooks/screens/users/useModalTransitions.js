/**
 * useModalTransitions.js
 * Custom hook for managing modal navigation transitions
 *
 * Handles:
 * - Transitioning from details modal to edit modal
 * - Transitioning from edit modal to address modals
 * - Transition delays for iOS fullScreen modal stacking
 * - Platform-specific animation handling
 *
 * Returns:
 * - handleTransitionToEditModal(userItem): Transition with origin tracking
 * - handleTransitionToAddressModal(index): Close edit, open address modal with delay
 * - handleTransitionAddressToEdit(): Close address, reopen edit modal with delay
 */

import { useCallback } from "react";
import { Platform } from "react-native";

const TRANSITION_DELAY_MS = 5; // Minimal delay for iOS modal animations

export function useModalTransitions(
  showDetailsModal,
  closeDetailsModal,
  openEditModal,
  openEditModalPreserveAddresses,
  setSelectedUserOnly,
  setReopenDetailsFlag,
  setShouldReopenDetailsOnEditClose,
  closeEditModal,
  openEditAddressModal,
  openAddAddressModal,
  closeAddressEditModal,
) {
  /**
   * Handle transition to edit modal with origin tracking
   * If coming from details modal, marks flag to reopen details on close
   */
  const handleTransitionToEditModal = useCallback(
    (userItem) => {
      if (showDetailsModal) {
        // Coming from details modal: track for reopening
        setReopenDetailsFlag();
        closeDetailsModal();
        if (Platform.OS === "ios") {
          setTimeout(() => {
            setSelectedUserOnly(userItem);
            openEditModal(userItem);
          }, TRANSITION_DELAY_MS);
        } else {
          setSelectedUserOnly(userItem);
          openEditModal(userItem);
        }
      } else {
        // Coming from list: don't reopen details on close
        setShouldReopenDetailsOnEditClose(false);
        setSelectedUserOnly(userItem);
        openEditModal(userItem);
      }
    },
    [
      showDetailsModal,
      setReopenDetailsFlag,
      closeDetailsModal,
      setSelectedUserOnly,
      openEditModal,
      setShouldReopenDetailsOnEditClose,
    ],
  );

  /**
   * Handle transition from edit modal to address edit modal
   */
  const handleTransitionToAddressModal = useCallback(
    (index, address) => {
      closeEditModal();
      if (Platform.OS === "ios") {
        setTimeout(() => {
          openEditAddressModal(index, address);
        }, TRANSITION_DELAY_MS);
      } else {
        openEditAddressModal(index, address);
      }
    },
    [closeEditModal, openEditAddressModal],
  );

  /**
   * Handle transition from edit modal to add address modal
   */
  const handleTransitionToAddAddressModal = useCallback(
    (addresses) => {
      closeEditModal();
      if (Platform.OS === "ios") {
        setTimeout(() => {
          openAddAddressModal(addresses);
        }, TRANSITION_DELAY_MS);
      } else {
        openAddAddressModal(addresses);
      }
    },
    [closeEditModal, openAddAddressModal],
  );

  /**
   * Handle transition from address modal back to edit modal
   * Preserves address changes in editForm - does not reset user data
   */
  const handleTransitionAddressToEdit = useCallback(() => {
    closeAddressEditModal();
    if (Platform.OS === "ios") {
      setTimeout(() => {
        openEditModalPreserveAddresses();
      }, TRANSITION_DELAY_MS);
    } else {
      openEditModalPreserveAddresses();
    }
  }, [closeAddressEditModal, openEditModalPreserveAddresses]);

  return {
    handleTransitionToEditModal,
    handleTransitionToAddressModal,
    handleTransitionToAddAddressModal,
    handleTransitionAddressToEdit,
  };
}

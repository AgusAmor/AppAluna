/**
 * useAddressEdit.js
 * Custom hook for managing user address editing, validation, and persistence
 * Handles: add/edit/delete address, form validation, default address logic, modal state
 * Returns: address form state, modal controls, save/delete/validate functions
 */

import { useState, useCallback } from "react";
import { Alert } from "react-native";

const initialAddressState = {
  street: "",
  number: "",
  city: "",
  region: "",
  postalCode: "",
  recipientName: "",
  recipientPhone: "",
  isDefault: false,
};

export function useAddressEdit(onSave) {
  const [showAddressEditModal, setShowAddressEditModal] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(initialAddressState);

  const openEditAddressModal = useCallback((index, address) => {
    setIsNewAddress(false);
    setEditingAddressIndex(index);
    setEditingAddress({ ...address });
    setShowAddressEditModal(true);
  }, []);

  const openAddAddressModal = useCallback((currentAddresses) => {
    setIsNewAddress(true);
    setEditingAddressIndex(null);
    setEditingAddress({
      ...initialAddressState,
      isDefault: currentAddresses.length === 0,
    });
    setShowAddressEditModal(true);
  }, []);

  const closeAddressEditModal = useCallback(() => {
    setShowAddressEditModal(false);
  }, []);

  const handleSaveAddress = useCallback(
    (currentAddresses, setEditForm) => {
      // Validate all fields
      if (
        !editingAddress.street ||
        !editingAddress.number ||
        !editingAddress.city ||
        !editingAddress.region ||
        !editingAddress.postalCode ||
        !editingAddress.recipientName ||
        !editingAddress.recipientPhone
      ) {
        Alert.alert("Error", "Todos los campos son obligatorios");
        return;
      }

      let updatedAddresses;

      if (isNewAddress) {
        updatedAddresses = [...currentAddresses, editingAddress];
      } else {
        updatedAddresses = [...currentAddresses];
        updatedAddresses[editingAddressIndex] = editingAddress;
      }

      // If this address is being set as default, unset others
      if (editingAddress.isDefault) {
        updatedAddresses.forEach((addr, idx) => {
          addr.isDefault = isNewAddress
            ? idx === updatedAddresses.length - 1
            : idx === editingAddressIndex;
        });
      }

      setEditForm((prev) => ({ ...prev, addresses: updatedAddresses }));
      setShowAddressEditModal(false);
      setIsNewAddress(false);
    },
    [editingAddress, editingAddressIndex, isNewAddress],
  );

  const handleDeleteAddress = useCallback(
    (index, currentAddresses, setEditForm) => {
      Alert.alert("Eliminar dirección", "¿Deseas eliminar esta dirección?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const updatedAddresses = currentAddresses.filter(
              (_, i) => i !== index,
            );
            setEditForm((prev) => ({ ...prev, addresses: updatedAddresses }));
          },
        },
      ]);
    },
    [],
  );

  return {
    showAddressEditModal,
    editingAddressIndex,
    isNewAddress,
    editingAddress,
    setEditingAddress,
    openEditAddressModal,
    openAddAddressModal,
    closeAddressEditModal,
    handleSaveAddress,
    handleDeleteAddress,
  };
}

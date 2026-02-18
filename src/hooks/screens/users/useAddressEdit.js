/**
 * useAddressEdit.js
 * Custom hook for managing user address editing, validation, and persistence
 * Handles: add/edit/delete address, form validation, default address logic, modal state
 * Returns: address form state, modal controls, save/delete/validate functions
 */

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import {
  createEmptyAddress,
  validateAddressFields,
  ensureDefaultAddress,
} from "../../../utils/addressUtils";
import {
  isValidContactPhone,
  validatePhoneMinDigits,
} from "../../../utils/validationService";

export function useAddressEdit(onSave) {
  const [showAddressEditModal, setShowAddressEditModal] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(createEmptyAddress());

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
      ...createEmptyAddress(),
      isDefault: currentAddresses.length === 0,
    });
    setShowAddressEditModal(true);
  }, []);

  const closeAddressEditModal = useCallback(() => {
    setShowAddressEditModal(false);
  }, []);

  const handleSaveAddress = useCallback(
    (currentAddresses, setEditForm) => {
      // Validate all fields using validateAddressFields (includes length validation)
      const errors = validateAddressFields(editingAddress);

      // It already validates phone format and min digits, but we can add extra validation here if needed
      // The validateAddressFields now includes min:7 for phone
      if (
        editingAddress.recipientPhone &&
        !isValidContactPhone(editingAddress.recipientPhone)
      ) {
        errors.recipientPhone =
          "Teléfono del Destinatario inválido. Solo números y símbolos +, -, ( )";
      }

      if (Object.keys(errors).length > 0) {
        const errorMessages = Object.values(errors);
        Alert.alert("Validación requerida", errorMessages.join("\n"));
        return;
      }

      let updatedAddresses;
      let addressToSave = { ...editingAddress };

      // Si es una nueva dirección y es la primera, hacerla predeterminada automáticamente
      if (isNewAddress && currentAddresses.length === 0) {
        addressToSave.isDefault = true;
      }

      if (isNewAddress) {
        updatedAddresses = [...currentAddresses, addressToSave];
      } else {
        updatedAddresses = [...currentAddresses];
        updatedAddresses[editingAddressIndex] = addressToSave;
      }

      // Si esta dirección es predeterminada, desmarcar las demás
      if (addressToSave.isDefault) {
        updatedAddresses.forEach((addr, idx) => {
          addr.isDefault = isNewAddress
            ? idx === updatedAddresses.length - 1
            : idx === editingAddressIndex;
        });
      }

      // Ensure at least one address is default
      updatedAddresses = ensureDefaultAddress(updatedAddresses);

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

            // If deleted address was default, ensure another becomes default
            const deletedWasDefault = currentAddresses[index]?.isDefault;
            if (deletedWasDefault && updatedAddresses.length > 0) {
              updatedAddresses = ensureDefaultAddress(updatedAddresses);
            }

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

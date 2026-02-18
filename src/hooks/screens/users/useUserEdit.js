/**
 * useUserEdit.js
 * Custom hook for managing user edit form state and persistence
 * Handles: edit form state management, modal visibility, save logic, API calls
 * Returns: editForm, setEditForm, showEditModal, openEditModal(), closeEditModal(), isSaving, handleSaveUser()
 */

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { saveUserChanges } from "../../../services/users";

/**
 * Validates form data before saving
 * @param {Object} formData - Form data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateUserForm(formData) {
  const errors = [];

  // Validate displayName
  if (!formData.displayName || formData.displayName.trim().length === 0) {
    errors.push("El nombre es obligatorio");
  }

  // Validate email
  if (!formData.email || formData.email.trim().length === 0) {
    errors.push("El email es obligatorio");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("El email no tiene un formato válido");
  }

  // Validate phone (optional but if provided, must be valid)
  if (formData.phone && formData.phone.trim().length > 0) {
    const cleanPhone = formData.phone.replace(/[\s\-\(\)\.]/g, "");
    if (!/^(\+)?[0-9]{7,}$/.test(cleanPhone)) {
      errors.push(
        "El número de teléfono no es válido. Usa solo números, espacios o el símbolo +",
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Maps error messages from API to user-friendly Spanish messages
 */
function mapErrorMessage(errorMessage) {
  const errorMap = {
    email: "El correo electrónico no es válido o ya está en uso",
    phone: "El número de teléfono no es válido",
    displayName: "El nombre no es válido",
    Firebase: "Error al conectar con el servidor",
  };

  for (const [key, friendlyMessage] of Object.entries(errorMap)) {
    if (errorMessage?.toLowerCase().includes(key.toLowerCase())) {
      return friendlyMessage;
    }
  }

  return "Error al actualizar el usuario. Por favor, intenta nuevamente";
}

export function useUserEdit() {
  const { getToken } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    addresses: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = useCallback((user) => {
    setEditForm({
      displayName: user.displayName || "",
      email: user.email || "",
      phone: user.phone || "",
      addresses: user.addresses ? [...user.addresses] : [],
    });
    setShowEditModal(true);
  }, []);

  const openEditModalPreserveAddresses = useCallback(() => {
    // Open modal without resetting form (used when returning from address modal)
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const handleSaveUser = useCallback(
    async (userId) => {
      if (!userId) return;

      try {
        setIsSaving(true);

        // Validate form first
        const validation = validateUserForm(editForm);
        if (!validation.isValid) {
          Alert.alert("Validación requerida", validation.errors.join("\n"));
          setIsSaving(false);
          return;
        }

        // Prepare data for saving - don't send empty phone
        const dataToSave = {
          displayName: editForm.displayName,
          email: editForm.email,
          phone: editForm.phone?.trim() || "", // Send empty string if phone is empty
          addresses: editForm.addresses,
        };

        const token = await getToken();
        await saveUserChanges(userId, dataToSave, token);
        Alert.alert("Éxito", "Usuario actualizado correctamente");
        setShowEditModal(false);
      } catch (err) {
        console.error("Error saving user:", err);
        const friendlyError = mapErrorMessage(err.message);
        Alert.alert("Error", friendlyError);
      } finally {
        setIsSaving(false);
      }
    },
    [editForm, getToken],
  );

  return {
    editForm,
    setEditForm,
    showEditModal,
    openEditModal,
    openEditModalPreserveAddresses,
    closeEditModal,
    isSaving,
    handleSaveUser,
  };
}

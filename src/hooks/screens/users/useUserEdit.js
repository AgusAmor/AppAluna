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

export function useUserEdit() {
  const { getToken } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    phone: "",
    addresses: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = useCallback((user) => {
    setEditForm({
      displayName: user.displayName || "",
      phone: user.phone || "",
      addresses: user.addresses ? [...user.addresses] : [],
    });
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
        const token = await getToken();
        await saveUserChanges(userId, editForm, token);
        Alert.alert("Éxito", "Usuario actualizado correctamente");
        setShowEditModal(false);
      } catch (err) {
        console.error("Error saving user:", err);
        Alert.alert("Error", err.message || "Error al actualizar usuario");
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
    closeEditModal,
    isSaving,
    handleSaveUser,
  };
}

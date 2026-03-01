/**
 * useUserActions.js
 * Custom hook for managing user-related actions and state changes
 * Handles: change account status (active/suspended), delete user, logout, action loading states
 * Returns: actioningUserId, handleChangeStatus(), handleDeleteUser(), handleLogout()
 */

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import {
  changeUserAccountStatus,
  deleteUserAccount,
} from "../../../services/users";

/**
 * Maps error messages from API to user-friendly Spanish messages
 */
function mapErrorMessage(errorMessage) {
  const errorMap = {
    email: "El correo electrónico no es válido o ya está en uso",
    phone: "El número de teléfono no es válido",
    displayName: "El nombre no es válido",
    authorization: "No tengas permiso para realizar esta acción",
    Firebase: "Error al conectar con el servidor",
  };

  for (const [key, friendlyMessage] of Object.entries(errorMap)) {
    if (errorMessage?.toLowerCase().includes(key.toLowerCase())) {
      return friendlyMessage;
    }
  }

  return "Ocurrió un error. Por favor, intenta nuevamente";
}

export function useUserActions() {
  const { logout, getToken } = useAuth();
  const [actioningUserId, setActioningUserId] = useState(null);

  const handleChangeStatus = useCallback(
    (userItem) => {
      const currentStatus = userItem.accountStatus || "active";
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      const statusText = newStatus === "active" ? "activar" : "suspender";
      const statusPastParticiple = newStatus === "active" ? "activada" : "suspendida";

      Alert.alert(
        "Cambiar estado de cuenta",
        `¿Deseas ${statusText} la cuenta de ${userItem.email}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Confirmar",
            onPress: async () => {
              try {
                setActioningUserId(userItem.id);
                const token = await getToken();
                await changeUserAccountStatus(userItem.id, newStatus, token);
                Alert.alert("Éxito", `Cuenta ${statusPastParticiple} correctamente`);
              } catch (err) {
                console.error("Error changing status:", err);
                const friendlyError = mapErrorMessage(err.message);
                Alert.alert("Error", friendlyError);
              } finally {
                setActioningUserId(null);
              }
            },
          },
        ],
      );
    },
    [getToken],
  );

  const handleDeleteUser = useCallback(
    (userItem) => {
      Alert.alert(
        "Eliminar usuario",
        `¿Estás seguro de que deseas eliminar a ${userItem.email}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                setActioningUserId(userItem.id);
                const token = await getToken();
                await deleteUserAccount(userItem.id, token);
                Alert.alert("Éxito", "Usuario eliminado correctamente");
              } catch (err) {
                console.error("Error deleting user:", err);
                const friendlyError = mapErrorMessage(err.message);
                Alert.alert("Error", friendlyError);
              } finally {
                setActioningUserId(null);
              }
            },
          },
        ],
      );
    },
    [getToken],
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      Alert.alert("Error", "Error al cerrar sesión");
    }
  }, [logout]);

  return {
    actioningUserId,
    handleChangeStatus,
    handleDeleteUser,
    handleLogout,
  };
}

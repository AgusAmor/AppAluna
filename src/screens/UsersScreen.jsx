import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  loadUsers,
  saveUserChanges,
  deleteUserAccount,
  changeUserAccountStatus,
  formatUserStatus,
  formatUserRole,
} from "../services/users";

/**
 * UsersScreen
 * Admin panel for managing users
 * Allows viewing, editing, and managing user account status
 */
const UsersScreen = ({ navigation }) => {
  const { user: authUser, logout, getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [actioningUserId, setActioningUserId] = useState(null);

  // Load users on mount
  useEffect(() => {
    loadUsersList();
  }, []);

  /**
   * Loads all users from Firestore
   */
  const loadUsersList = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersList = await loadUsers();
      setUsers(usersList);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens details modal to view user information
   */
  const handleViewUser = (userItem) => {
    setSelectedUser(userItem);
    setShowDetailsModal(true);
  };

  /**
   * Opens edit modal for a user
   */
  const handleEditUser = (userItem) => {
    setSelectedUser(userItem);
    setEditForm({
      displayName: userItem.displayName || "",
      phone: userItem.phone || "",
    });
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  /**
   * Saves user changes
   */
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setIsSaving(true);
      const token = await getToken();
      await saveUserChanges(selectedUser.id, editForm, token);
      Alert.alert("Éxito", "Usuario actualizado correctamente");
      setShowEditModal(false);
      await loadUsersList();
    } catch (err) {
      console.error("Error saving user:", err);
      Alert.alert("Error", err.message || "Error al actualizar usuario");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Changes user account status (active/suspended)
   */
  const handleChangeStatus = (userItem) => {
    const currentStatus = userItem.accountStatus || "active";
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const statusText = newStatus === "active" ? "activar" : "suspender";

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
              Alert.alert("Éxito", `Cuenta ${statusText}ada correctamente`);
              await loadUsersList();
            } catch (err) {
              console.error("Error changing status:", err);
              Alert.alert("Error", err.message || "Error al cambiar estado");
            } finally {
              setActioningUserId(null);
            }
          },
        },
      ],
    );
  };

  /**
   * Deletes a user with confirmation
   */
  const handleDeleteUser = (userItem) => {
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
              Alert.alert("Éxito", "Usuario eliminado");
              await loadUsersList();
            } catch (err) {
              console.error("Error deleting user:", err);
              Alert.alert("Error", err.message || "Error al eliminar");
            } finally {
              setActioningUserId(null);
            }
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      Alert.alert("Error", "Error al cerrar sesión");
    }
  };

  /**
   * Format timestamp for display
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate?.() || new Date(timestamp);
      return date.toLocaleDateString("es-AR");
    } catch {
      return "-";
    }
  };

  // Render user item in list
  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName || "Sin nombre"}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userMeta}>
          <Text style={styles.userMetaText}>{formatUserRole(item.role)}</Text>
          <Text
            style={[
              styles.userStatus,
              item.accountStatus === "active"
                ? styles.statusActive
                : styles.statusSuspended,
            ]}
          >
            {formatUserStatus(item.accountStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewUser(item)}
        >
          <Text style={styles.actionButtonEmoji}>👁️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditUser(item)}
        >
          <Text style={styles.actionButtonEmoji}>✏️</Text>
        </TouchableOpacity>

        {actioningUserId === item.id ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : (
          <TouchableOpacity
            style={[
              styles.actionButton,
              item.accountStatus === "active"
                ? styles.suspendButton
                : styles.activateButton,
            ]}
            onPress={() => handleChangeStatus(item)}
          >
            <Text style={styles.actionButtonEmoji}>
              {item.accountStatus === "active" ? "🔒" : "🔓"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation?.goBack?.()}
      >
        <Text style={styles.backText}>← Atrás</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Gestión de Usuarios</Text>
      <Text style={styles.subtitle}>Total: {users.length} usuarios</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay usuarios</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.usersList}
          scrollEnabled={true}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles del Usuario</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsContainer}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Nombre</Text>
                <Text style={styles.detailValue}>
                  {selectedUser?.displayName || "-"}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{selectedUser?.email}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Teléfono</Text>
                <Text style={styles.detailValue}>
                  {selectedUser?.phone || "-"}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Rol</Text>
                <Text style={styles.detailValue}>
                  {formatUserRole(selectedUser?.role)}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Estado de Cuenta</Text>
                <Text
                  style={[
                    styles.detailValue,
                    selectedUser?.accountStatus === "active"
                      ? styles.statusActive
                      : styles.statusSuspended,
                  ]}
                >
                  {formatUserStatus(selectedUser?.accountStatus)}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Email Verificado</Text>
                <Text style={styles.detailValue}>
                  {selectedUser?.emailVerified ? "Sí" : "No"}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Pedidos Totales</Text>
                <Text style={styles.detailValue}>
                  {selectedUser?.totalOrders || 0}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Gasto Total</Text>
                <Text style={styles.detailValue}>
                  ${(selectedUser?.totalSpent || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Creado el</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedUser?.createdAt)}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Último login</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedUser?.lastLoginAt)}
                </Text>
              </View>

              {selectedUser?.addresses && selectedUser.addresses.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>
                    Direcciones ({selectedUser.addresses.length})
                  </Text>
                  {selectedUser.addresses.map((addr, idx) => (
                    <Text key={idx} style={styles.addressText}>
                      {addr.street} {addr.number}, {addr.region}
                      {addr.isDefault ? " (Principal)" : ""}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cerrar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditUser(selectedUser)}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Usuario</Text>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={editForm.displayName}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, displayName: text })
                }
                placeholder="Nombre"
                editable={!isSaving}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={selectedUser?.email}
                editable={false}
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={editForm.phone}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, phone: text })
                }
                placeholder="Teléfono"
                editable={!isSaving}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.buttonDisabled]}
                onPress={handleSaveUser}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  backButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  usersList: {
    gap: 12,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  userEmail: {
    fontSize: 14,
    color: "#3B82F6",
    marginTop: 4,
  },
  userMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    alignItems: "center",
  },
  userMetaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  userStatus: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  statusSuspended: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonEmoji: {
    fontSize: 18,
  },
  suspendButton: {
    backgroundColor: "#FEE2E2",
  },
  activateButton: {
    backgroundColor: "#D1FAE5",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeButton: {
    fontSize: 24,
    color: "#6B7280",
    fontWeight: "bold",
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  addressText: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
    paddingLeft: 8,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    color: "#1F2937",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "600",
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F59E0B",
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default UsersScreen;

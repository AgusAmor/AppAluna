import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import {
  loadUsers,
  saveUserChanges,
  deleteUserAccount,
  changeUserAccountStatus,
  formatUserStatus,
  formatUserRole,
} from "../services/users";
import {
  UserDetailsModal,
  UserEditModal,
  AddressEditModal,
} from "../components/modals";

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
    addresses: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [actioningUserId, setActioningUserId] = useState(null);
  const [showAddressEditModal, setShowAddressEditModal] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState({
    street: "",
    number: "",
    city: "",
    region: "",
    postalCode: "",
    recipientName: "",
    recipientPhone: "",
    isDefault: false,
  });

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
      addresses: userItem.addresses ? [...userItem.addresses] : [],
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
   * Opens address edit modal for editing a specific address
   */
  const handleEditAddress = (index) => {
    setIsNewAddress(false);
    setEditingAddressIndex(index);
    setEditingAddress({ ...editForm.addresses[index] });
    setShowEditModal(false); // Close parent modal first
    setShowAddressEditModal(true);
  };

  /**
   * Saves changes to a specific address
   * Ensures only one address can be marked as default
   */
  const handleSaveAddress = () => {
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
      // Add new address to the list
      updatedAddresses = [...editForm.addresses, editingAddress];
    } else {
      // Update existing address
      updatedAddresses = [...editForm.addresses];
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

    setEditForm({ ...editForm, addresses: updatedAddresses });
    setShowAddressEditModal(false);
    setShowEditModal(true); // Reopen parent modal
    setIsNewAddress(false);
  };

  /**
   * Deletes an address from the list
   */
  const handleDeleteAddress = (index) => {
    Alert.alert("Eliminar dirección", "¿Deseas eliminar esta dirección?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          const updatedAddresses = editForm.addresses.filter(
            (_, i) => i !== index,
          );
          setEditForm({ ...editForm, addresses: updatedAddresses });
        },
      },
    ]);
  };

  /**
   * Opens modal to add a new address
   */
  const handleAddAddress = () => {
    setIsNewAddress(true);
    setEditingAddressIndex(null);
    setEditingAddress({
      street: "",
      number: "",
      city: "",
      region: "",
      postalCode: "",
      recipientName: "",
      recipientPhone: "",
      isDefault: editForm.addresses.length === 0, // First address is default
    });
    setShowEditModal(false); // Close parent modal first
    setShowAddressEditModal(true);
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
      <ScreenContainer>
        <ActivityIndicator size="large" color="#3B82F6" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
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
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          onEndReachedThreshold={0.1}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* User Details Modal */}
      <UserDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        user={selectedUser}
        onEdit={() => handleEditUser(selectedUser)}
        formatDate={formatDate}
        formatUserStatus={formatUserStatus}
        formatUserRole={formatUserRole}
      />

      {/* User Edit Modal */}
      <UserEditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        editForm={editForm}
        onFormChange={setEditForm}
        onSave={handleSaveUser}
        isSaving={isSaving}
        onEditAddress={handleEditAddress}
        onDeleteAddress={handleDeleteAddress}
        onAddAddress={handleAddAddress}
      />

      {/* Address Edit Modal */}
      <AddressEditModal
        visible={showAddressEditModal}
        onClose={() => {
          setShowAddressEditModal(false);
          setShowEditModal(true); // Reopen parent modal on close
        }}
        isNew={isNewAddress}
        address={editingAddress}
        onAddressChange={setEditingAddress}
        onSave={handleSaveAddress}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
});

export default UsersScreen;

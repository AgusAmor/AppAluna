import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import {
  useUsersList,
  useUserModal,
  useUserEdit,
  useAddressEdit,
  useUserActions,
} from "../hooks/screens";
import { formatUserStatus, formatUserRole } from "../services/users";
import {
  UserDetailsModal,
  UserEditModal,
  AddressEditModal,
} from "../components/modals";

/**
 * UsersScreen
 * Admin panel for managing users
 * Allows viewing, editing, and managing user account status
 *
 * Uses custom hooks for clean separation of concerns:
 * - useUsersList: List, pagination, debouncing
 * - useUserModal: Details modal state
 * - useUserEdit: Edit form state
 * - useAddressEdit: Address form state
 * - useUserActions: User actions (delete, status change, logout)
 */
const UsersScreen = ({ navigation }) => {
  // Data management hooks
  const { users, memoizedUsers, loading, error, loadMore, hasMore } =
    useUsersList();
  const {
    selectedUser,
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal,
  } = useUserModal();
  const {
    editForm,
    setEditForm,
    showEditModal,
    openEditModal,
    closeEditModal,
    isSaving,
    handleSaveUser,
  } = useUserEdit();
  const {
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
  } = useAddressEdit();
  const {
    actioningUserId,
    handleChangeStatus,
    handleDeleteUser,
    handleLogout,
  } = useUserActions();

  /**
   * Format timestamp for display
   */
  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate?.() || new Date(timestamp);
      return date.toLocaleDateString("es-AR");
    } catch {
      return "-";
    }
  }, []);

  /**
   * Handle edit user - opens edit modal with user data
   */
  const handleEditUserWrapper = useCallback(
    (userItem) => {
      openEditModal(userItem);
      closeDetailsModal();
    },
    [openEditModal, closeDetailsModal],
  );

  /**
   * Handle edit address - opens address edit modal
   */
  const handleEditAddressWrapper = useCallback(
    (index) => {
      openEditAddressModal(index, editForm.addresses[index]);
      closeEditModal();
    },
    [openEditAddressModal, closeEditModal, editForm.addresses],
  );

  /**
   * Handle delete address - removes address from list
   */
  const handleDeleteAddressWrapper = useCallback(
    (index) => {
      handleDeleteAddress(index, editForm.addresses, setEditForm);
    },
    [handleDeleteAddress, editForm.addresses],
  );

  /**
   * Handle add address - opens modal to add new address
   */
  const handleAddAddressWrapper = useCallback(() => {
    openAddAddressModal(editForm.addresses);
    closeEditModal();
  }, [openAddAddressModal, closeEditModal, editForm.addresses]);

  /**
   * Handle save address - validates and saves address changes
   */
  const handleSaveAddressWrapper = useCallback(() => {
    handleSaveAddress(editForm.addresses, setEditForm);
  }, [handleSaveAddress, editForm.addresses, setEditForm]);

  /**
   * Handle save user - saves user changes to database
   */
  const handleSaveUserWrapper = useCallback(async () => {
    await handleSaveUser(selectedUser?.id);
  }, [handleSaveUser, selectedUser?.id]);

  // Render user item in list
  const renderUserItem = useCallback(
    ({ item }) => (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.displayName || "Sin nombre"}
          </Text>
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
            onPress={() => openDetailsModal(item)}
          >
            <Text style={styles.actionButtonEmoji}>👁️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditUserWrapper(item)}
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
    ),
    [
      actioningUserId,
      openDetailsModal,
      handleEditUserWrapper,
      handleChangeStatus,
      formatUserRole,
      formatUserStatus,
    ],
  );

  // Loading state
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
          data={memoizedUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.usersList}
          scrollEnabled={true}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          onEndReachedThreshold={0.1}
          onEndReached={hasMore ? () => loadMore() : null}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.loadMoreText}>
                  Cargando más usuarios...
                </Text>
              </View>
            ) : null
          }
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* User Details Modal */}
      <UserDetailsModal
        visible={showDetailsModal}
        onClose={closeDetailsModal}
        user={selectedUser}
        onEdit={() => handleEditUserWrapper(selectedUser)}
        formatDate={formatDate}
        formatUserStatus={formatUserStatus}
        formatUserRole={formatUserRole}
      />

      {/* User Edit Modal */}
      <UserEditModal
        visible={showEditModal}
        onClose={closeEditModal}
        user={selectedUser}
        editForm={editForm}
        onFormChange={setEditForm}
        onSave={handleSaveUserWrapper}
        isSaving={isSaving}
        onEditAddress={handleEditAddressWrapper}
        onDeleteAddress={handleDeleteAddressWrapper}
        onAddAddress={handleAddAddressWrapper}
      />

      {/* Address Edit Modal */}
      <AddressEditModal
        visible={showAddressEditModal}
        onClose={() => {
          closeAddressEditModal();
          openEditModal(selectedUser);
        }}
        isNew={isNewAddress}
        address={editingAddress}
        onAddressChange={setEditingAddress}
        onSave={handleSaveAddressWrapper}
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
  loadMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default UsersScreen;

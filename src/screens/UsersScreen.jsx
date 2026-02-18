import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Eye, Edit, Lock, Unlock } from "lucide-react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import {
  useUsersList,
  useUserModal,
  useUserEdit,
  useAddressEdit,
  useUserActions,
  useModalTransitions,
  useModalReopenLogic,
} from "../hooks/screens";
import { formatUserStatus, formatUserRole } from "../services/users";
import {
  UserDetailsModal,
  UserEditModal,
  AddressEditModal,
} from "../components/modals";
import { useThemeColors, fonts } from "../theme";

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
const UsersScreen = () => {
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  // Data management hooks
  const { users, memoizedUsers, loading, error, loadMore, hasMore } =
    useUsersList();
  const {
    selectedUser,
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal,
    setSelectedUserOnly,
    shouldReopenDetailsOnEditClose,
    setReopenDetailsFlag,
    setShouldReopenDetailsOnEditClose,
    clearSelectedUser,
    updateSelectedUserFromList,
  } = useUserModal();
  const {
    editForm,
    setEditForm,
    showEditModal,
    openEditModal,
    openEditModalPreserveAddresses,
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
  const { actioningUserId, handleChangeStatus, handleDeleteUser } =
    useUserActions();

  // Modal transition handlers
  const {
    handleTransitionToEditModal,
    handleTransitionToAddressModal,
    handleTransitionToAddAddressModal,
    handleTransitionAddressToEdit,
  } = useModalTransitions(
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
  );

  // Modal reopen logic handlers
  const { handleEditModalClose, handleDetailsModalClose } = useModalReopenLogic(
    closeEditModal,
    openDetailsModal,
    setShouldReopenDetailsOnEditClose,
    clearSelectedUser,
    closeDetailsModal,
  );

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
   * Wrapper for edit user - transitions to edit modal with origin tracking
   */
  const handleEditUserWrapper = useCallback(
    (item) => {
      handleTransitionToEditModal(item);
    },
    [handleTransitionToEditModal],
  );

  /**
   * Wrapper for edit address - transitions to address edit modal
   */
  const handleEditAddressWrapper = useCallback(
    (index) => {
      handleTransitionToAddressModal(index, editForm.addresses[index]);
    },
    [handleTransitionToAddressModal, editForm.addresses],
  );

  /**
   * Wrapper for add address - transitions to add address modal
   */
  const handleAddAddressWrapper = useCallback(() => {
    handleTransitionToAddAddressModal(editForm.addresses);
  }, [handleTransitionToAddAddressModal, editForm.addresses]);

  /**
   * Wrapper for delete address - removes address from list
   */
  const handleDeleteAddressWrapper = useCallback(
    (index) => {
      handleDeleteAddress(index, editForm.addresses, setEditForm);
    },
    [handleDeleteAddress, editForm.addresses],
  );

  /**
   * Wrapper for save address - validates and saves address changes
   */
  const handleSaveAddressWrapper = useCallback(() => {
    handleSaveAddress(editForm.addresses, setEditForm);
    // Transition back to edit modal
    handleTransitionAddressToEdit();
  }, [
    handleSaveAddress,
    editForm.addresses,
    setEditForm,
    handleTransitionAddressToEdit,
  ]);

  /**
   * Wrapper for save user - saves changes and manages modal transitions
   */
  const handleSaveUserWrapper = useCallback(async () => {
    await handleSaveUser(selectedUser?.id);
    // Update selected user with latest data from list
    updateSelectedUserFromList(users);
    handleEditModalClose(selectedUser, shouldReopenDetailsOnEditClose);
  }, [
    handleSaveUser,
    selectedUser,
    handleEditModalClose,
    shouldReopenDetailsOnEditClose,
    updateSelectedUserFromList,
    users,
  ]);

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
            <Eye size={20} color={colorScheme.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditUserWrapper(item)}
          >
            <Edit size={20} color={colorScheme.primary} />
          </TouchableOpacity>

          {actioningUserId === item.id ? (
            <ActivityIndicator size="small" color={colorScheme.primary} />
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
              {item.accountStatus === "active" ? (
                <Lock size={20} color={colorScheme.error} />
              ) : (
                <Unlock size={20} color={colorScheme.success} />
              )}
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
        <ActivityIndicator size="large" color={colorScheme.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <Text style={styles.subtitle}>Total: {users.length} usuarios</Text>
      </View>

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
                <ActivityIndicator size="small" color={colorScheme.primary} />
                <Text style={styles.loadMoreText}>
                  Cargando más usuarios...
                </Text>
              </View>
            ) : null
          }
        />
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        visible={showDetailsModal}
        onClose={() => handleDetailsModalClose(shouldReopenDetailsOnEditClose)}
        user={selectedUser}
        onEdit={() => {
          if (selectedUser) {
            handleTransitionToEditModal(selectedUser);
          }
        }}
        formatDate={formatDate}
        formatUserStatus={formatUserStatus}
        formatUserRole={formatUserRole}
      />

      {/* User Edit Modal */}
      <UserEditModal
        visible={showEditModal}
        onClose={() =>
          handleEditModalClose(selectedUser, shouldReopenDetailsOnEditClose)
        }
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
        onClose={handleTransitionAddressToEdit}
        isNew={isNewAddress}
        address={editingAddress}
        onAddressChange={setEditingAddress}
        onSave={handleSaveAddressWrapper}
      />
    </ScreenContainer>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    header: {
      marginTop: 20,
      marginBottom: 32,
    },
    title: {
      ...fonts.heading.h1,
      color: colorScheme.text,
      marginBottom: 4,
    },
    subtitle: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 2,
    },
    errorBox: {
      backgroundColor: `${colorScheme.error}20`,
      borderColor: colorScheme.error,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      ...fonts.body.base,
      color: colorScheme.error,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      ...fonts.body.base,
      color: colorScheme.textLight,
    },
    usersList: {
      gap: 12,
      paddingBottom: 20,
    },
    userCard: {
      backgroundColor: colorScheme.backgroundLight2,
      borderRadius: 8,
      padding: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderLeftWidth: 4,
      borderLeftColor: colorScheme.primary,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      ...fonts.heading.h4,
      color: colorScheme.text,
    },
    userEmail: {
      ...fonts.body.base,
      color: colorScheme.primary,
      fontSize: 13,
      marginTop: 4,
    },
    userMeta: {
      flexDirection: "row",
      gap: 8,
      marginTop: 6,
      alignItems: "center",
    },
    userMetaText: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
    },
    userStatus: {
      ...fonts.body.sm,
      fontWeight: "600",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    statusActive: {
      backgroundColor: colorScheme.success,
      color: colorScheme.background,
    },
    statusSuspended: {
      backgroundColor: colorScheme.error,
      color: colorScheme.background,
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
      backgroundColor: colorScheme.backgroundLight,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colorScheme.border,
    },
    actionButtonEmoji: {
      fontSize: 18,
    },
    suspendButton: {
      backgroundColor: `${colorScheme.error}25`,
      borderColor: colorScheme.error,
    },
    activateButton: {
      backgroundColor: `${colorScheme.success}25`,
      borderColor: colorScheme.success,
    },
    logoutButton: {
      backgroundColor: colorScheme.error,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 16,
    },
    logoutText: {
      ...fonts.button,
      color: colorScheme.background,
    },
    loadMoreContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      gap: 8,
    },
    loadMoreText: {
      ...fonts.body.base,
      color: colorScheme.textLight,
    },
  });

export default UsersScreen;

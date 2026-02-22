import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
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
  useUsersFilter,
  ACCOUNT_STATUS_FILTERS,
} from "../hooks/screens";
import { usePagination } from "../hooks/loading";
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
  const { filteredUsers, loading, error } = useUsersList();
  const {
    filteredUsers: searchFilteredUsers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
  } = useUsersFilter(filteredUsers);

  // Pagination: load 20 users at a time
  const {
    visibleItems: memoizedUsers,
    loadMore,
    hasMore,
  } = usePagination(searchFilteredUsers, 20);
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
    updateSelectedUserFromList(filteredUsers);
    handleEditModalClose(selectedUser, shouldReopenDetailsOnEditClose);
  }, [
    handleSaveUser,
    selectedUser,
    handleEditModalClose,
    shouldReopenDetailsOnEditClose,
    updateSelectedUserFromList,
    filteredUsers,
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
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Search and Filter Controls */}
      <View style={styles.filterContainer}>
        <Text style={styles.totalUsers}>
          Total: {searchFilteredUsers.length} usuarios
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o email..."
          placeholderTextColor={colorScheme.textLight}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Status Filter Buttons */}
      <View style={styles.statusFilterContainer}>
        <TouchableOpacity
          style={[
            styles.statusFilterButton,
            statusFilter === ACCOUNT_STATUS_FILTERS.ALL &&
              styles.statusFilterButtonActive,
          ]}
          onPress={() => setStatusFilter(ACCOUNT_STATUS_FILTERS.ALL)}
        >
          <Text
            style={[
              styles.statusFilterButtonText,
              statusFilter === ACCOUNT_STATUS_FILTERS.ALL &&
                styles.statusFilterButtonTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusFilterButton,
            statusFilter === ACCOUNT_STATUS_FILTERS.ACTIVE &&
              styles.statusFilterButtonActive,
          ]}
          onPress={() => setStatusFilter(ACCOUNT_STATUS_FILTERS.ACTIVE)}
        >
          <Text
            style={[
              styles.statusFilterButtonText,
              statusFilter === ACCOUNT_STATUS_FILTERS.ACTIVE &&
                styles.statusFilterButtonTextActive,
            ]}
          >
            Activos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusFilterButton,
            statusFilter === ACCOUNT_STATUS_FILTERS.SUSPENDED &&
              styles.statusFilterButtonActive,
          ]}
          onPress={() => setStatusFilter(ACCOUNT_STATUS_FILTERS.SUSPENDED)}
        >
          <Text
            style={[
              styles.statusFilterButtonText,
              statusFilter === ACCOUNT_STATUS_FILTERS.SUSPENDED &&
                styles.statusFilterButtonTextActive,
            ]}
          >
            Suspendidos
          </Text>
        </TouchableOpacity>
      </View>

      {searchFilteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay resultados a la búsqueda</Text>
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
      marginBottom: 16,
    },
    title: {
      ...fonts.heading.h1,
      color: colorScheme.text,
      marginBottom: 4,
    },
    totalUsers: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 8,
      textAlign: "right",
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
      backgroundColor: colorScheme.accent,
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
    filterContainer: {
      marginBottom: 12,
    },
    searchInput: {
      ...fonts.body.base,
      backgroundColor: colorScheme.backgroundLight2,
      borderColor: colorScheme.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colorScheme.text,
      marginBottom: 2,
    },
    statusFilterContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 32,
      justifyContent: "space-between",
    },
    statusFilterButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colorScheme.backgroundLight2,
      borderWidth: 1,
      borderColor: colorScheme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    statusFilterButtonActive: {
      backgroundColor: colorScheme.primary,
      borderColor: colorScheme.primary,
    },
    statusFilterButtonText: {
      ...fonts.body.sm,
      color: colorScheme.text,
      fontWeight: "500",
    },
    statusFilterButtonTextActive: {
      color: colorScheme.background,
      fontWeight: "600",
    },
  });

export default UsersScreen;

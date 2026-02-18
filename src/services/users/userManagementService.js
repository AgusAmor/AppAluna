/**
 * userManagementService.js
 * Business logic for user management
 * Contains pure functions with no React/component dependencies
 * Orchestrates calls to firebaseUserService
 */

import {
  fetchUsers,
  fetchUserById,
  deleteUser,
  updateUser,
  setAdminRole,
  listenToUsers,
} from "../firebase/firebaseUserService";

/**
 * Gets the ID token from a Firebase Auth user
 * Used for API calls that require authentication
 *
 * @param {Object} authUser - Firebase Auth user object
 * @returns {Promise<string>} - ID token
 * @throws {Error} - If user is not authenticated or token cannot be obtained
 */
export async function getAuthToken(authUser) {
  if (!authUser) {
    throw new Error("User not authenticated");
  }
  try {
    const token = await authUser.getIdToken();
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    throw new Error("Failed to get authentication token");
  }
}

/**
 * Validates that a token exists
 * Token should be obtained from AuthContext's getToken() method
 *
 * @param {string} token - Auth token
 * @throws {Error} - If token is missing
 *
 * @ref https://firebase.google.com/docs/auth/admin/verify-id-tokens
 */
function validateToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("User token not found. Please log in again.");
  }
}

/**
 * Loads all users from Firestore
 * @returns {Promise<Array>} - Array of user objects with id property
 * @throws {Error} If users cannot be fetched
 */
export async function loadUsers() {
  try {
    const users = await fetchUsers();
    return users;
  } catch (error) {
    console.error("Error loading users:", error);
    throw new Error("Failed to load users");
  }
}

/**
 * Subscribes to real-time updates of all users
 * Perfect for syncing data when multiple admins are using the app
 *
 * @param {Function} callback - Called with users array whenever data changes
 * @returns {Function} Unsubscribe function - call to stop listening
 * @throws {Error} If listener setup fails
 *
 * Usage:
 *   const unsubscribe = subscribeToUsers((users) => {
 *     setUsers(users);
 *   });
 *   // Stop listening when component unmounts
 *   return () => unsubscribe();
 */
export function subscribeToUsers(callback) {
  try {
    return listenToUsers(callback);
  } catch (error) {
    console.error("Error subscribing to users:", error);
    throw error;
  }
}

/**
 * Loads a single user by ID
 * @param {string} userId - User ID to fetch
 * @returns {Promise<Object>} - User object with id property
 * @throws {Error} If user cannot be fetched
 */
export async function loadUserById(userId) {
  try {
    const user = await fetchUserById(userId);
    return user;
  } catch (error) {
    console.error("Error loading user:", error);
    throw error;
  }
}

/**
 * Updates an existing user
 * Only admins can call this for other users
 *
 * @param {string} userId - User ID to update
 * @param {Object} formData - User data to update
 * @param {string} token - Firebase Auth token from context's getToken()
 * @returns {Promise<Array>} - Updated list of users
 * @throws {Error} If update fails
 */
export async function saveUserChanges(userId, formData, token) {
  try {
    validateToken(token);

    // Build update object - only include non-empty fields
    const updateData = {
      displayName: formData.displayName,
      email: formData.email,
      addresses: formData.addresses,
    };

    // Only include phone if it's not empty
    if (formData.phone && formData.phone.trim().length > 0) {
      updateData.phone = formData.phone;
    } else {
      // Send empty string to clear phone if it was empty
      updateData.phone = "";
    }

    // Call API to update user
    await updateUser(userId, updateData, token);

    // Reload and return all users
    const updatedUsers = await loadUsers();
    return updatedUsers;
  } catch (error) {
    console.error("Error saving user changes:", error);
    throw error;
  }
}

/**
 * Deletes a user
 * Only admins can delete users
 *
 * @param {string} userId - User ID to delete
 * @param {string} token - Firebase Auth token from context's getToken()
 * @returns {Promise<void>}
 * @throws {Error} If delete fails or user is not admin
 */
export async function deleteUserAccount(userId, token) {
  try {
    validateToken(token);
    await deleteUser(userId, token);
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
}

/**
 * Changes user account status (active/suspended/inactive)
 * Only admins can perform this action
 *
 * @param {string} userId - User ID
 * @param {string} newStatus - New account status (active, suspended, inactive)
 * @param {string} token - Firebase Auth token from context's getToken()
 * @returns {Promise<Array>} - Updated list of users
 * @throws {Error} If operation fails or user is not admin
 */
export async function changeUserAccountStatus(userId, newStatus, token) {
  try {
    validateToken(token);

    // Only allow valid statuses
    const validStatuses = ["active", "suspended", "inactive"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    // Call API to update user
    await updateUser(userId, { accountStatus: newStatus }, token);

    // Reload and return all users
    const updatedUsers = await loadUsers();
    return updatedUsers;
  } catch (error) {
    console.error("Error changing user account status:", error);
    throw error;
  }
}

/**
 * Toggles a user's admin role
 * Promotes user to admin or removes admin privileges
 *
 * @param {string} userId - User ID to toggle role for
 * @param {boolean} shouldBeAdmin - Whether user should have admin role
 * @param {Object} authUser - Current admin user (must have admin privileges)
 * @returns {Promise<Object>} - Result from endpoint with success message
 * @throws {Error} If operation fails or user is not admin
 */
export async function toggleUserAdminRole(userId, shouldBeAdmin, authUser) {
  try {
    const token = await getAuthToken(authUser);
    const response = await setAdminRole(userId, shouldBeAdmin, token);
    return response;
  } catch (error) {
    console.error("Error toggling user admin role:", error);
    throw error;
  }
}

/**
 * Formats user's default address for display
 * Used in user lists and detail views
 *
 * @param {Array} addresses - Array of user address objects
 * @returns {string} - Formatted address string or "-" if none
 */
export function formatDefaultAddress(addresses) {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return "-";
  }

  const defaultAddress = addresses.find((a) => a.isDefault);
  if (!defaultAddress) return "-";

  const formatted = `${defaultAddress.street || ""} ${
    defaultAddress.number || ""
  } · ${defaultAddress.region || ""}`
    .trim()
    .replace(/^\s*·\s*$/, "-");

  return formatted || "-";
}

/**
 * Formats a user status for display
 * @param {string} status - User account status
 * @returns {string} - Formatted status or original value
 */
export function formatUserStatus(status) {
  const statusMap = {
    active: "Activo",
    inactive: "Inactivo",
    suspended: "Suspendido",
    deleted: "Eliminado",
  };
  return statusMap[status] || status || "Desconocido";
}

/**
 * Formats a user role for display
 * @param {string} role - User role
 * @returns {string} - Formatted role
 */
export function formatUserRole(role) {
  const roleMap = {
    admin: "Administrador",
    user: "Usuario",
    moderator: "Moderador",
  };
  return roleMap[role] || role || "Usuario";
}

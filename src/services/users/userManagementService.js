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
} from "../firebase/firebaseUserService";

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

    // Call API to update user
    await updateUser(userId, formData, token);

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

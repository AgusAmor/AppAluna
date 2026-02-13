/**
 * firebaseUserService.js
 * Firebase API calls for user management
 * Communicates directly with Cloud Functions endpoints
 * 
 * Reference: https://firebase.google.com/docs/firestore/security/get-started
 */

import { apiPost, apiPostAuth, apiGet } from "./apiClient";
import { firestore } from "./firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

/**
 * Fetches all users directly from Firestore
 * Read-only operation, no authentication required for admin view
 * @returns {Promise<Array>} Array of user objects with IDs
 * @throws {Error} If Firestore read fails
 * 
 * @ref https://firebase.google.com/docs/firestore/query-data/get-data
 */
export async function fetchUsers() {
  try {
    const usersCollection = collection(firestore, "users");
    const snapshot = await getDocs(usersCollection);
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return users;
  } catch (error) {
    console.error("Error fetching users from Firestore:", error);
    throw new Error("Failed to fetch users from Firestore");
  }
}

/**
 * Fetches a single user by ID from Firestore
 * @param {string} id - User ID
 * @returns {Promise<Object>} User object with id property
 * @throws {Error} If user not found
 * 
 * @ref https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
 */
export async function fetchUserById(id) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid user ID is required");
  }
  try {
    const userDoc = doc(firestore, "users", id);
    const snapshot = await getDoc(userDoc);

    if (!snapshot.exists()) {
      throw new Error("User not found");
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Error fetching user by ID from Firestore:", error);
    throw error;
  }
}

/**
 * Updates a user in Firestore via Cloud Function
 * POST /updateUserDoc?id=userId
 * 
 * @param {string} id - User ID
 * @param {Object} userData - User data to update (displayName, email, phone, addresses, accountStatus)
 * @param {string} token - Firebase Auth token
 * @returns {Promise<Object>} Result from endpoint
 * @throws {Error} If update fails
 * 
 * @ref https://firebase.google.com/docs/functions/http-events
 */
export async function updateUser(id, userData, token) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid user ID is required");
  }
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await apiPostAuth("/updateUserDoc", userData, token, {
      query: { id },
    });
    return response;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Deletes a user via Cloud Function
 * POST /deleteUser with requireAdmin middleware
 * 
 * @param {string} id - User ID to delete
 * @param {string} token - Firebase Auth token (must be admin)
 * @returns {Promise<Object>} Result from endpoint
 * @throws {Error} If delete fails or user is not admin
 * 
 * @ref https://firebase.google.com/docs/auth/admin/manage-users#delete_a_user
 */
export async function deleteUser(id, token) {
  if (!id) {
    throw new Error("User ID is required");
  }
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await apiPostAuth("/deleteUser", { id }, token);
    return response;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

/**
 * Sets a user as admin or removes admin privileges
 * POST /setAdminRole with requireAdmin middleware
 * 
 * @param {string} userId - User ID to promote/demote
 * @param {boolean} isAdmin - Whether user should be admin
 * @param {string} token - Firebase Auth token (must be admin)
 * @returns {Promise<Object>} Result from endpoint with success message
 * @throws {Error} If operation fails or user is not admin
 * 
 * @ref https://firebase.google.com/docs/auth/admin/custom-claims
 */
export async function setAdminRole(userId, isAdmin, token) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  if (typeof isAdmin !== "boolean") {
    throw new Error("isAdmin must be a boolean");
  }
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await apiPostAuth(
      "/setAdminRole",
      { userId, isAdmin },
      token
    );
    return response;
  } catch (error) {
    console.error("Error setting admin role:", error);
    throw error;
  }
}

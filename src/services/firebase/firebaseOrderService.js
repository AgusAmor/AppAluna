/**
 * firebaseOrderService.js
 * Firebase Cloud Functions integration for orders.
 * All order operations go through Cloud Functions for security and validation.
 */

import { apiGet, apiPostAuth } from "./apiClient";
import { auth } from "./firebase";

/**
 * Retrieves all orders (admin only)
 * GET /getAllOrders
 * Requires: Admin authentication and token
 * @param {string} token - Firebase Auth token (must be from admin user)
 * @returns {Promise<Array>} Array of order objects
 * @throws {Error} If token is missing or request fails
 */
export async function fetchAllOrders(token) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  try {
    const response = await apiGet("/getAllOrders", { token });
    // Handle both direct response and response.orders format
    if (Array.isArray(response)) {
      return response;
    }
    return response.orders || response.data || [];
  } catch (error) {
    console.error("Error fetching all orders from Cloud Function:", error);
    throw new Error("Failed to fetch orders from Firebase");
  }
}

/**
 * Retrieves orders for a specific user
 * GET /getUserOrders
 * Returns current authenticated user's orders
 * @param {string} token - Firebase Auth token
 * @returns {Promise<Array>} Array of order objects for the user
 * @throws {Error} If token is missing or request fails
 */
export async function fetchUserOrders(token) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  try {
    const response = await apiGet("/getUserOrders", { token });
    if (Array.isArray(response)) {
      return response;
    }
    return response.orders || response.data || [];
  } catch (error) {
    console.error("Error fetching user orders from Cloud Function:", error);
    throw new Error("Failed to fetch user orders");
  }
}

/**
 * Retrieves a single order by ID
 * GET /getOrder?orderId=ID
 * @param {string} orderId - Order document ID
 * @param {string} token - Firebase Auth token
 * @returns {Promise<Object>} Order data with id property
 * @throws {Error} If orderId is invalid or request fails
 */
export async function fetchOrderById(orderId, token) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  if (!orderId || typeof orderId !== "string") {
    throw new Error("Valid order ID is required");
  }
  try {
    const response = await apiGet("/getOrder", {
      token,
      query: { orderId },
    });
    // Ensure the response has an id property
    if (response && !response.id && response.orderId) {
      response.id = response.orderId;
    }
    return response || {};
  } catch (error) {
    console.error("Error fetching order by ID from Cloud Function:", error);
    throw new Error("Failed to fetch order");
  }
}

/**
 * Creates a new order via Cloud Function
 * @param {Object} orderData - Complete order object
 * @param {string} token - Firebase Auth token
 * @returns {Promise<Object>} - Created order with ID
 * @throws {Error} - If creation fails
 */
export async function createOrder(orderData, token) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  try {
    const response = await apiPostAuth("/createOrder", orderData, token);
    return response;
  } catch (error) {
    console.error("Error creating order via Cloud Function:", error);
    throw error;
  }
}

/**
 * Updates order status
 * @param {Object} updateData - {orderId, newStatus, note, updatedBy}
 * @param {string} token - Firebase Auth token
 * @returns {Promise<Object>} - Updated order
 * @throws {Error} - If update fails
 */
export async function updateOrderStatus(updateData, token) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  try {
    const response = await apiPostAuth("/updateOrderStatus", updateData, token);
    return response;
  } catch (error) {
    console.error("Error updating order status via Cloud Function:", error);
    throw error;
  }
}

/**
 * Deletes an order (admin only)
 * @param {string} orderId - Order document ID
 * @param {string} token - Firebase Auth token
 * @returns {Promise<Object>} - Deletion confirmation
 * @throws {Error} - If deletion fails
 */
export async function deleteOrder(orderId, token) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  if (!orderId || typeof orderId !== "string") {
    throw new Error("Valid order ID is required");
  }
  try {
    const response = await apiPostAuth("/deleteOrder", { orderId }, token);
    return response;
  } catch (error) {
    console.error("Error deleting order via Cloud Function:", error);
    throw error;
  }
}

/**
 * Subscribes to real-time updates of all orders using polling
 * Since orders have strict Firestore rules, we fetch from Cloud Functions periodically
 *
 * @param {Function} callback - Called with orders array whenever data changes: (orders) => {}
 * @returns {Function} Unsubscribe function to stop polling
 * @throws {Error} If polling setup fails
 */
/**
 * Subscribes to real-time updates of all orders using polling
 * Polls Cloud Functions every 3 seconds and calls callback when data changes
 * Ensures token is available from current authenticated user
 *
 * @param {Function} callback - Called with orders array: (orders) => {}
 * @returns {Function} Unsubscribe function to stop polling
 * @throws {Error} If polling setup fails
 */
export function listenToOrders(callback) {
  let lastOrders = [];
  let intervalId = null;
  let isPolling = true;

  const pollOrders = async () => {
    try {
      // Get fresh token from current user
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        console.warn("No authentication token available for polling orders");
        return;
      }

      const orders = await fetchAllOrders(token);

      // Ensure orders is an array
      const ordersList = Array.isArray(orders) ? orders : [];

      // Check if data actually changed to avoid unnecessary re-renders
      const hasChanged =
        JSON.stringify(lastOrders) !== JSON.stringify(ordersList);
      if (hasChanged) {
        lastOrders = ordersList;
        callback(ordersList);
      }
    } catch (error) {
      console.error("Error polling orders:", error);
      // Continue polling even on error
    }
  };

  // Initial fetch
  pollOrders();

  // Set up polling interval (3 seconds)
  intervalId = setInterval(() => {
    if (isPolling) {
      pollOrders();
    }
  }, 3000);

  // Return unsubscribe function
  return () => {
    isPolling = false;
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

export default {
  fetchAllOrders,
  fetchUserOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  listenToOrders,
};

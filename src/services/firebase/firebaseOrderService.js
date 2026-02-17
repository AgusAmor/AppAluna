/**
 * firebaseOrderService.js
 * Firebase Cloud Functions integration for orders.
 * All order operations go through Cloud Functions for security and validation.
 */

import { apiGet, apiPostAuth } from "./apiClient";

/**
 * Retrieves all orders (admin only)
 * GET /getAllOrders
 * Requires: Admin authentication and token
 */
export async function fetchAllOrders(token) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  try {
    const response = await apiGet("/getAllOrders", { token });
    return response.orders || [];
  } catch (error) {
    console.error("Error fetching all orders from Cloud Function:", error);
    throw new Error("Failed to fetch orders from Firebase");
  }
}

/**
 * Retrieves orders for a specific user
 * @param {string} userId - User ID
 * @param {string} token - Firebase Auth token
 * @returns {Promise<Array>} Array of order objects for the user
 * @throws {Error} If retrieval fails
 */
export async function fetchUserOrders(userId, token) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  try {
    const response = await apiGet("/getUserOrders", { token });
    return response.orders || [];
  } catch (error) {
    console.error("Error fetching user orders from Cloud Function:", error);
    throw new Error("Failed to fetch user orders");
  }
}

/**
 * Retrieves a single order by ID
 * @param {string} orderId - Order document ID
 * @param {string} token - Firebase Auth token
 * @returns {Promise<Object>} Order data
 * @throws {Error} If retrieval fails
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
    return response;
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

export default {
  fetchAllOrders,
  fetchUserOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};

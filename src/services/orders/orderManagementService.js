/**
 * orderManagementService.js
 * Business logic for order management
 * Orchestrates order operations and data transformations
 */

import {
  fetchAllOrders,
  fetchUserOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../firebase/firebaseOrderService";
import { getAuthToken } from "./userManagementService";

// Order status constants matching backend
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

/**
 * Loads all orders from Firestore (admin view)
 * @returns {Promise<Array>} - Array of order objects with id property
 * @throws {Error} If orders cannot be fetched
 */
export async function loadAllOrders() {
  try {
    const orders = await fetchAllOrders();
    return orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA; // Sort newest first
    });
  } catch (error) {
    console.error("Error loading all orders:", error);
    throw new Error("Failed to load orders");
  }
}

/**
 * Loads orders for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of user's order objects
 * @throws {Error} If orders cannot be fetched
 */
export async function loadUserOrdersById(userId) {
  try {
    const orders = await fetchUserOrders(userId);
    return orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error loading user orders:", error);
    throw error;
  }
}

/**
 * Loads a single order by ID
 * @param {string} orderId - Order ID to fetch
 * @returns {Promise<Object>} - Order object with id property
 * @throws {Error} If order cannot be fetched
 */
export async function loadOrderById(orderId) {
  try {
    const order = await fetchOrderById(orderId);
    return order;
  } catch (error) {
    console.error("Error loading order:", error);
    throw error;
  }
}

/**
 * Updates order status (admin operation)
 * @param {string} orderId - Order ID to update
 * @param {string} newStatus - New status value
 * @param {string} note - Optional note about the status change
 * @param {Object} authUser - Firebase Auth user object (must be admin)
 * @returns {Promise<Object>} - Updated order data
 * @throws {Error} If update fails or user is not admin
 */
export async function changeOrderStatus(orderId, newStatus, note = "", authUser) {
  try {
    const token = await getAuthToken(authUser);

    if (!Object.values(ORDER_STATUS).includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const response = await updateOrderStatus(
      orderId,
      {
        status: newStatus,
        note: note || `Order status changed to ${newStatus}`,
      },
      token
    );

    return response;
  } catch (error) {
    console.error("Error changing order status:", error);
    throw error;
  }
}

/**
 * Deletes an order (admin operation)
 * @param {string} orderId - Order ID to delete
 * @param {Object} authUser - Firebase Auth user object (must be admin)
 * @returns {Promise<void>}
 * @throws {Error} If delete fails or user is not admin
 */
export async function deleteOrderById(orderId, authUser) {
  try {
    const token = await getAuthToken(authUser);
    await deleteOrder(orderId, token);
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}

/**
 * Generates a human-readable order number
 * Format: ALN-YYYYMMDD-XXXXX
 * @param {Date} date - Order date (default: current date)
 * @returns {string} - Formatted order number
 */
export function generateOrderNumber(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const randomSequence = String(Math.floor(Math.random() * 90000) + 10000);

  return `ALN-${year}${month}${day}-${randomSequence}`;
}

/**
 * Formats order status for display
 * @param {string} status - Order status
 * @returns {string} - Formatted status string
 */
export function formatOrderStatus(status) {
  const statusMap = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    processing: "En procesamiento",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  return statusMap[status] || status;
}

/**
 * Formats a date for display
 * @param {Date|Timestamp} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDateTime(date) {
  if (!date) return "-";

  try {
    const d = date.toDate?.() || new Date(date);
    return d.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

/**
 * Formats order summary for display
 * @param {Object} summary - Order summary object {subtotal, shipping, total}
 * @returns {Object} - Formatted summary with currency
 */
export function formatOrderSummary(summary) {
  if (!summary) return {};

  return {
    subtotal: `$${(summary.subtotal || 0).toFixed(2)}`,
    shipping: `$${(summary.shipping || 0).toFixed(2)}`,
    total: `$${(summary.total || 0).toFixed(2)}`,
  };
}

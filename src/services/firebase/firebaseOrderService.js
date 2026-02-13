/**
 * firebaseOrderService.js
 * Firebase API calls for order management
 * Communicates with Cloud Functions endpoints for order operations
 * 
 * @ref https://firebase.google.com/docs/functions/write-firebase-functions
 */

import { apiPost, apiPostAuth } from "../firebase/apiClient";
import { firestore } from "../firebase/firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

/**
 * Fetches all orders from Firestore
 * Only admins should call this endpoint
 * 
 * @returns {Promise<Array>} Array of order objects with IDs
 * @throws {Error} If Firestore read fails
 * 
 * @ref https://firebase.google.com/docs/firestore/query-data/order-limit-data
 */
export async function fetchAllOrders() {
  try {
    const ordersCollection = collection(firestore, "orders");
    const snapshot = await getDocs(ordersCollection);
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return orders;
  } catch (error) {
    console.error("Error fetching all orders from Firestore:", error);
    throw new Error("Failed to fetch orders from Firestore");
  }
}

/**
 * Fetches orders for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of order objects for the user
 * @throws {Error} If Firestore read fails
 */
export async function fetchUserOrders(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const ordersCollection = collection(firestore, "orders");
    const q = query(ordersCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return orders;
  } catch (error) {
    console.error("Error fetching user orders from Firestore:", error);
    throw new Error("Failed to fetch user orders");
  }
}

/**
 * Fetches a single order by ID
 * @param {string} id - Order ID
 * @returns {Promise<Object>} Order object with id property
 * @throws {Error} If order not found
 */
export async function fetchOrderById(id) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid order ID is required");
  }
  try {
    const orderDoc = doc(firestore, "orders", id);
    const snapshot = await getDoc(orderDoc);

    if (!snapshot.exists()) {
      throw new Error("Order not found");
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Error fetching order by ID from Firestore:", error);
    throw error;
  }
}

/**
 * Creates a new order via Cloud Function
 * POST /createOrder
 * 
 * @param {Object} orderData - Order data (orderNumber, userId, customerInfo, items, summary, delivery, statusHistory)
 * @param {string} token - Firebase Auth token
 * @returns {Promise<Object>} Result with new order id
 * @throws {Error} If creation fails
 * 
 * @ref https://firebase.google.com/docs/firestore/manage-data/add-data
 */
export async function createOrder(orderData, token) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  if (!orderData) {
    throw new Error("Order data is required");
  }

  try {
    const response = await apiPostAuth("/createOrder", orderData, token);
    return response;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/**
 * Updates an order status via Cloud Function
 * POST /updateOrderStatus with requireAdmin middleware
 * 
 * @param {string} orderId - Order ID
 * @param {Object} statusData - Status update data (status, note)
 * @param {string} token - Firebase Auth token (must be admin)
 * @returns {Promise<Object>} Result from endpoint
 * @throws {Error} If update fails or user is not admin
 */
export async function updateOrderStatus(orderId, statusData, token) {
  if (!orderId || typeof orderId !== "string") {
    throw new Error("Valid order ID is required");
  }
  if (!token) {
    throw new Error("Authentication token is required");
  }
  if (!statusData || !statusData.status) {
    throw new Error("Status data with status field is required");
  }

  try {
    const response = await apiPostAuth(
      "/updateOrderStatus",
      { orderId, ...statusData },
      token
    );
    return response;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

/**
 * Deletes an order via Cloud Function
 * POST /deleteOrder with requireAdmin middleware
 * 
 * @param {string} id - Order ID to delete
 * @param {string} token - Firebase Auth token (must be admin)
 * @returns {Promise<Object>} Result from endpoint
 * @throws {Error} If delete fails or user is not admin
 */
export async function deleteOrder(id, token) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid order ID is required");
  }
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await apiPostAuth("/deleteOrder", { id }, token);
    return response;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}

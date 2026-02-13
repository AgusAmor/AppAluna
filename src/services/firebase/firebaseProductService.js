/**
 * firebaseProductService.js
 * Firebase API calls for product management
 * Communicates with Cloud Functions endpoints for CRUD operations
 * 
 * @ref https://firebase.google.com/docs/functions/write-firebase-functions
 */

import { apiPost, apiPostAuth } from "../firebase/apiClient";
import { firestore } from "../firebase/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

/**
 * Fetches all products from Firestore
 * Products are public data, no authentication required
 * 
 * @returns {Promise<Array>} Array of product objects with IDs
 * @throws {Error} If Firestore read fails
 * 
 * @ref https://firebase.google.com/docs/firestore/query-data/get-data
 */
export async function fetchProducts() {
  try {
    const productsCollection = collection(firestore, "products");
    const snapshot = await getDocs(productsCollection);
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return products;
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    throw new Error("Failed to fetch products from Firestore");
  }
}

/**
 * Fetches a single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product object with id property
 * @throws {Error} If product not found
 */
export async function fetchProductById(id) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid product ID is required");
  }
  try {
    const productDoc = doc(firestore, "products", id);
    const snapshot = await getDoc(productDoc);

    if (!snapshot.exists()) {
      throw new Error("Product not found");
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Error fetching product by ID from Firestore:", error);
    throw error;
  }
}

/**
 * Creates a new product via Cloud Function
 * POST /createProduct with requireAdmin middleware
 * 
 * @param {Object} productData - Product data (name, description, imageUrl, pricing, family, etc.)
 * @param {string} token - Firebase Auth token (must be admin)
 * @returns {Promise<Object>} Result with new product id
 * @throws {Error} If creation fails or user is not admin
 * 
 * @ref https://firebase.google.com/docs/firestore/manage-data/add-data
 */
export async function createProduct(productData, token) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  if (!productData) {
    throw new Error("Product data is required");
  }

  try {
    const response = await apiPostAuth("/createProduct", productData, token);
    return response;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

/**
 * Updates an existing product via Cloud Function
 * POST /updateProduct with requireAdmin middleware
 * 
 * @param {string} id - Product ID
 * @param {Object} productData - Updated product data
 * @param {string} token - Firebase Auth token (must be admin)
 * @returns {Promise<Object>} Result from endpoint
 * @throws {Error} If update fails or user is not admin
 */
export async function updateProduct(id, productData, token) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid product ID is required");
  }
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await apiPostAuth(
      "/updateProduct",
      { id, ...productData },
      token
    );
    return response;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

/**
 * Deletes a product via Cloud Function
 * POST /deleteProduct with requireAdmin middleware
 * 
 * @param {string} id - Product ID to delete
 * @param {string} token - Firebase Auth token (must be admin)
 * @returns {Promise<Object>} Result from endpoint
 * @throws {Error} If delete fails or user is not admin
 */
export async function deleteProduct(id, token) {
  if (!id || typeof id !== "string") {
    throw new Error("Valid product ID is required");
  }
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await apiPostAuth("/deleteProduct", { id }, token);
    return response;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

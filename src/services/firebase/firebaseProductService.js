/**
 * firebaseProductService.js
 * Firebase API calls for product management
 * Communicates with Cloud Functions endpoints for CRUD operations
 *
 * @ref https://firebase.google.com/docs/functions/write-firebase-functions
 */

import { apiPost, apiPostAuth } from "./apiClient";
import { firestore, storage } from "./firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { createListener } from "./firebaseListenerUtil";

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
      token,
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

/**
 * Listens for real-time updates to all products from Firestore
 * Perfect for syncing when inventory or pricing changes
 *
 * @param {Function} callback - Called with products array: (products) => {}
 * @returns {Function} Unsubscribe function to stop listening
 * @throws {Error} If listener setup fails
 */
export function listenToProducts(callback) {
  try {
    return createListener("products", callback);
  } catch (error) {
    console.error("Error setting up products listener:", error);
    throw error;
  }
}

/**
 * Uploads a product image from a mobile image URI to Firebase Storage
 * Converts URI to blob and uploads to storage
 *
 * @param {string} imageUri - Local image URI from image picker
 * @param {string} productId - Product ID (used in file path)
 * @returns {Promise<string>} Public download URL of the uploaded image
 * @throws {Error} If fetch, blob conversion, or upload fails
 *
 * @ref https://firebase.google.com/docs/storage/web/upload-files
 */
export async function uploadProductImageMobile(imageUri, productId) {
  if (!imageUri || typeof imageUri !== "string") {
    throw new Error("Valid image URI is required");
  }

  try {
    // Generate unique filename with timestamp and product ID
    const uniqueName = `products/${productId}_${Date.now()}_${Math.floor(
      Math.random() * 10000,
    )}.jpg`;

    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload blob to Firebase Storage
    const storageRef = ref(storage, uniqueName);
    await uploadBytes(storageRef, blob);

    // Get and return download URL
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Deletes a product image from Firebase Storage
 * Extracts storage path from full download URL
 *
 * @param {string} imageUrl - Full Firebase Storage download URL
 * @returns {Promise<void>}
 * @throws {Error} If path extraction or deletion fails
 *
 * @ref https://firebase.google.com/docs/storage/web/delete-files
 */
export async function deleteProductImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") {
    console.warn("No valid image URL provided for deletion");
    return;
  }

  try {
    // Extract storage path from download URL
    // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?...
    const match = imageUrl.match(/\/o\/([^?]+)/);
    if (!match || !match[1]) {
      console.error("Could not extract image path from URL:", imageUrl);
      throw new Error("Could not extract image path from URL");
    }

    const filePath = decodeURIComponent(match[1]);

    // Delete from Storage
    const imageRef = ref(storage, filePath);
    await deleteObject(imageRef);
    console.log("Image deleted from Storage:", filePath);
  } catch (error) {
    console.error("Error deleting product image:", error);
    throw error;
  }
}

/**
 * Replaces a product image in Firebase Storage
 * Deletes old image and uploads new one
 *
 * @param {string} newImageUri - New image URI from image picker
 * @param {string} productId - Product ID for file naming
 * @param {string} oldImageUrl - URL of old image to delete
 * @returns {Promise<string>} Download URL of new image
 * @throws {Error} If replacement fails
 */
export async function replaceProductImageMobile(
  newImageUri,
  productId,
  oldImageUrl,
) {
  try {
    // Delete old image if it exists
    if (oldImageUrl) {
      try {
        await deleteProductImage(oldImageUrl);
      } catch (err) {
        console.error("Warning: could not delete old image:", err);
        // Don't throw - continue with new upload
      }
    }

    // Upload new image
    return await uploadProductImageMobile(newImageUri, productId);
  } catch (error) {
    console.error("Error replacing product image:", error);
    throw error;
  }
}

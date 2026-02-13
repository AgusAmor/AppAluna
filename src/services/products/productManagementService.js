/**
 * productManagementService.js
 * Business logic for product management
 * Orchestrates product CRUD operations and data transformations
 */

import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../firebase/firebaseProductService";
import { getAuthToken } from "./userManagementService";

/**
 * Loads all products from Firestore
 * @returns {Promise<Array>} - Array of product objects with id property
 * @throws {Error} If products cannot be fetched
 */
export async function loadProducts() {
  try {
    const products = await fetchProducts();
    return products;
  } catch (error) {
    console.error("Error loading products:", error);
    throw new Error("Failed to load products");
  }
}

/**
 * Loads a single product by ID
 * @param {string} productId - Product ID to fetch
 * @returns {Promise<Object>} - Product object with id property
 * @throws {Error} If product cannot be fetched
 */
export async function loadProductById(productId) {
  try {
    const product = await fetchProductById(productId);
    return product;
  } catch (error) {
    console.error("Error loading product:", error);
    throw error;
  }
}

/**
 * Creates a new product
 * Only admins can create products
 * 
 * @param {Object} formData - Product form data
 * @param {Object} authUser - Firebase Auth user object (must be admin)
 * @returns {Promise<Object>} - Result with new product id
 * @throws {Error} If creation fails or user is not admin
 */
export async function saveNewProduct(formData, authUser) {
  try {
    const token = await getAuthToken(authUser);

    // Validate required fields
    if (!formData.name || !formData.description || !formData.family) {
      throw new Error("Name, description, and family are required");
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      family: formData.family,
      imageUrl: formData.imageUrl,
      pricing: formData.pricing || {},
      status: formData.status || "active",
    };

    const result = await createProduct(productData, token);
    return result;
  } catch (error) {
    console.error("Error saving new product:", error);
    throw error;
  }
}

/**
 * Updates an existing product
 * Only admins can update products
 * 
 * @param {string} productId - Product ID to update
 * @param {Object} formData - Updated product data
 * @param {Object} authUser - Firebase Auth user object (must be admin)
 * @returns {Promise<Array>} - Updated list of products
 * @throws {Error} If update fails or user is not admin
 */
export async function saveProductChanges(productId, formData, authUser) {
  try {
    const token = await getAuthToken(authUser);

    const productData = {
      name: formData.name,
      description: formData.description,
      family: formData.family,
      imageUrl: formData.imageUrl,
      pricing: formData.pricing || {},
      status: formData.status || "active",
    };

    await updateProduct(productId, productData, token);

    // Reload and return all products
    const updatedProducts = await loadProducts();
    return updatedProducts;
  } catch (error) {
    console.error("Error saving product changes:", error);
    throw error;
  }
}

/**
 * Deletes a product
 * Only admins can delete products
 * 
 * @param {string} productId - Product ID to delete
 * @param {Object} authUser - Firebase Auth user object (must be admin)
 * @returns {Promise<void>}
 * @throws {Error} If delete fails or user is not admin
 */
export async function deleteProductAccount(productId, authUser) {
  try {
    const token = await getAuthToken(authUser);
    await deleteProduct(productId, token);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

/**
 * Formats a product for display
 * @param {Object} product - Product object
 * @returns {Object} - Formatted product object
 */
export function formatProduct(product) {
  if (!product) return null;

  return {
    id: product.id,
    name: product.name || "Sin nombre",
    description: product.description || "",
    family: product.family || "General",
    imageUrl: product.imageUrl || "",
    status: product.status || "active",
    pricing: product.pricing || {},
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Formats pricing information for display
 * @param {Object} pricing - Pricing object with normal and small sizes
 * @returns {string} - Formatted pricing string
 */
export function formatPricing(pricing) {
  if (!pricing) return "-";

  const parts = [];

  if (pricing.normal?.price) {
    parts.push(`Normal: $${pricing.normal.price}`);
  }

  if (pricing.small?.price) {
    parts.push(`Chico: $${pricing.small.price}`);
  }

  return parts.length > 0 ? parts.join(" | ") : "-";
}

/**
 * Firebase API Client Utility for React Native
 * Centralizes API calls to Firebase Functions with authentication and error handling
 * Follows the same pattern as web client for consistency
 */

const REGION = "southamerica-east1";
const BASE_URL =
  process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_BASE_URL ||
  "http://localhost:5001";

/**
 * Makes an API request to Firebase Functions
 * @param {string} endpoint - API endpoint (e.g., '/setAdminRole', '/updateProduct')
 * @param {object} options - Fetch options { method, body, token, query }
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} With descriptive error message
 */
export async function apiCall(endpoint, options = {}) {
  const { method = "GET", body = null, token = null, query = null } = options;

  // Build URL with query params if provided
  let url = `${BASE_URL}${endpoint}`;
  if (query) {
    const params = new URLSearchParams(query);
    url += `?${params.toString()}`;
  }

  // Build headers
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    // Make request
    const response = await fetch(url, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    });

    // Parse response
    const data = await response.json().catch(() => ({}));

    // Handle errors
    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Makes a GET request to Firebase Functions
 * @param {string} endpoint - API endpoint
 * @param {object} options - Options { token, query }
 * @returns {Promise<any>} Parsed response
 */
export function apiGet(endpoint, options = {}) {
  return apiCall(endpoint, { method: "GET", ...options });
}

/**
 * Makes a POST request to Firebase Functions
 * @param {string} endpoint - API endpoint
 * @param {any} body - Request body
 * @param {string} token - Firebase Auth token (optional)
 * @returns {Promise<any>} Parsed response
 */
export function apiPost(endpoint, body, token = null) {
  return apiCall(endpoint, { method: "POST", body, token });
}

/**
 * Makes an authenticated POST request
 * @param {string} endpoint - API endpoint
 * @param {any} body - Request body
 * @param {string} token - Firebase Auth token (required)
 * @param {object} options - Additional options { query }
 * @returns {Promise<any>} Parsed response
 */
export function apiPostAuth(endpoint, body, token, options = {}) {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  return apiCall(endpoint, { method: "POST", body, token, ...options });
}

export default {
  apiCall,
  apiGet,
  apiPost,
  apiPostAuth,
};

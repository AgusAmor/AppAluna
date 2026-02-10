import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const REGION = "southamerica-east1";
const BASE_URL =
  process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_BASE_URL ||
  "http://localhost:5001";

/**
 * Call a Cloud Function with user's authentication token
 * @param {string} functionName - Name of the Cloud Function
 * @param {object} data - Request data
 * @param {string} token - User's ID token (from Firebase Auth)
 * @returns {Promise<any>} Response from the function
 */
export async function callFunction(functionName, data = {}, token = null) {
  try {
    // Get the function reference
    const fn = httpsCallable(functions, functionName);

    // Prepare payload with token in headers if available
    const payload = {
      ...data,
      ...(token && { _token: token }), // Include token in payload
    };

    // Call the function
    const response = await fn(payload);

    return response.data;
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error);

    // Enhance error message
    const errorMessage = error.message || "Error calling Cloud Function";

    throw new Error(errorMessage);
  }
}

/**
 * Helper to call function with current user's token
 * @param {string} functionName - Name of the Cloud Function
 * @param {object} data - Request data
 * @param {object} currentUser - Firebase user object
 * @returns {Promise<any>}
 */
export async function callFunctionWithAuth(
  functionName,
  data = {},
  currentUser,
) {
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  const token = await currentUser.getIdToken();
  return callFunction(functionName, data, token);
}

export default {
  callFunction,
  callFunctionWithAuth,
};

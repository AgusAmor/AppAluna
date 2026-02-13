/**
 * firebaseListenerUtil.js
 * Generic utility for setting up real-time listeners on Firestore collections
 * Centralizes listener logic to be reused across all services
 *
 * Usage:
 *   import { createListener } from './firebaseListenerUtil';
 *   const unsubscribe = createListener('users', (data) => {
 *     setUsers(data);
 *   });
 *   // Later, to stop listening:
 *   return () => unsubscribe();
 */

import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "./firebase";

/**
 * Creates a real-time listener on a Firestore collection
 * Generic utility that can be used for any collection (users, orders, products, etc.)
 *
 * @param {string} collectionName - Name of Firestore collection to listen to
 * @param {Function} onDataCallback - Called with array of documents whenever data changes
 * @param {Function} onErrorCallback - Optional: Called if listener encounters an error
 * @returns {Function} Unsubscribe function - call to stop listening and cleanup
 *
 * @throws {Error} If collectionName is invalid or listener setup fails
 *
 * @ref https://firebase.google.com/docs/firestore/query-data/listen
 *
 * Example:
 *   const unsubscribe = createListener(
 *     'users',
 *     (users) => setUsers(users),
 *     (error) => console.error('Listener error:', error)
 *   );
 *
 *   // Clean up when component unmounts
 *   return () => unsubscribe();
 */
export function createListener(
  collectionName,
  onDataCallback,
  onErrorCallback = null,
) {
  if (!collectionName || typeof collectionName !== "string") {
    throw new Error("Valid collection name is required");
  }

  if (typeof onDataCallback !== "function") {
    throw new Error("Callback function is required");
  }

  try {
    const collectionRef = collection(firestore, collectionName);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          onDataCallback(data);
        } catch (error) {
          console.error(`Error processing ${collectionName} data:`, error);
          if (onErrorCallback) {
            onErrorCallback(error);
          }
        }
      },
      (error) => {
        console.error(`Error listening to ${collectionName}:`, error);

        // Call error callback if provided
        if (onErrorCallback) {
          onErrorCallback(error);
        } else {
          // Default: call data callback with empty array on error
          onDataCallback([]);
        }
      },
    );

    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up listener for ${collectionName}:`, error);
    throw error;
  }
}

export default createListener;

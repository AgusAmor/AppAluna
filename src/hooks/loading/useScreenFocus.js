/**
 * useScreenFocus.js
 * Custom hook to manage listeners with lifecycle management
 * Prevents unnecessary data syncing and battery drain
 */

import { useEffect } from "react";

/**
 * Manages lifecycle of listeners based on screen focus
 * Automatically unsubscribes when screen loses focus
 *
 * @param {Function} setupListener - Function that returns unsubscribe function
 *   Example: () => subscribeToUsers((users) => setUsers(users))
 *
 * @returns {void}
 *
 * Example:
 *   useScreenFocus(() => {
 *     const unsubscribe = subscribeToUsers(setUsers);
 *     return () => unsubscribe();
 *   });
 */
export function useScreenFocus(setupListener) {
  useEffect(() => {
    // Subscribe when component mounts
    const unsubscribe = setupListener();

    // Unsubscribe when screen loses focus
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  });
}

export default useScreenFocus;

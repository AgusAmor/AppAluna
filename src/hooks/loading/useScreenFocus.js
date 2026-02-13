/**
 * useScreenFocus.js
 * Custom hook to manage listeners only when screen is in focus
 * Prevents unnecessary data syncing and battery drain when user is on another screen
 *
 * @ref https://reactnavigation.org/docs/use-focus-effect
 */

import { useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

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
  useFocusEffect(() => {
    // Subscribe when screen comes into focus
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

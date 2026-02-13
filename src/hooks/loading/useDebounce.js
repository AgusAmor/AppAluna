/**
 * useDebounce.js
 * Custom hook to debounce value changes
 * Useful for debouncing rapid state updates on Android to prevent UI lag
 *
 * @ref https://react.dev/reference/react/useEffect
 */

import { useState, useEffect } from "react";

/**
 * Debounces a value - delays updating until changes stop for specified duration
 * Perfect for handling rapid updates from Firestore listeners
 *
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} Debounced value
 *
 * Example:
 *   const [users, setUsers] = useState([]);
 *   const debouncedUsers = useDebounce(users, 300);
 *   // debouncedUsers only updates 300ms after users stops changing
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timer to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timer if value changes before delay completes
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

/**
 * useLoginForm.js
 * Custom hook for managing login form state and logic
 *
 * Handles:
 * - Email and password state
 * - Form validation
 * - Login submission
 * - Loading state
 *
 * Returns:
 * - email: Email input value
 * - password: Password input value
 * - loading: Loading state during login attempt
 * - error: Error message from context
 * - setEmail(value): Update email
 * - setPassword(value): Update password
 * - handleLogin(): Submit login form
 */

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // No need to show alert - navigation will handle redirect
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert(
        "Error de Login",
        err.message || error || "Error desconocido",
      );
    } finally {
      setLoading(false);
    }
  }, [email, password, login, error]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleLogin,
  };
}

export default useLoginForm;

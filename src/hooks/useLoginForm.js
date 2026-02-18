/**
 * useLoginForm.js
 * Custom hook for managing login form state and logic
 *
 * Handles:
 * - Email and password state
 * - Form validation with field-level errors
 * - Login submission
 * - Loading state
 *
 * Returns:
 * - email: Email input value
 * - password: Password input value
 * - loading: Loading state during login attempt
 * - error: Error message from context
 * - fieldErrors: Validation errors { email, password }
 * - setEmail(value): Update email with validation
 * - setPassword(value): Update password with validation
 * - handleLogin(): Submit login form
 */

import { useState, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { validateRequired, isValidEmail } from "../utils/validationService";

export function useLoginForm() {
  const [email, setEmailState] = useState("");
  const [password, setPasswordState] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, error } = useAuth();

  // Validate email field
  const validateEmailField = useCallback((value) => {
    let error = null;

    const requiredError = validateRequired(value, "El email");
    if (requiredError) {
      error = requiredError;
    } else if (!isValidEmail(value)) {
      error = "El email no tiene un formato válido";
    }

    setFieldErrors((prev) => ({ ...prev, email: error }));
    return error;
  }, []);

  // Validate password field
  const validatePasswordField = useCallback((value) => {
    let error = null;

    const requiredError = validateRequired(value, "La contraseña");
    if (requiredError) {
      error = requiredError;
    } else if (value.length < 6) {
      error = "La contraseña debe tener al menos 6 caracteres";
    }

    setFieldErrors((prev) => ({ ...prev, password: error }));
    return error;
  }, []);

  // Handle email change with validation
  const setEmail = useCallback(
    (value) => {
      setEmailState(value);
      validateEmailField(value);
    },
    [validateEmailField],
  );

  // Handle password change with validation
  const setPassword = useCallback(
    (value) => {
      setPasswordState(value);
      validatePasswordField(value);
    },
    [validatePasswordField],
  );

  // Check if form has errors
  const hasErrors = useMemo(() => {
    return Object.values(fieldErrors).some((error) => error !== null);
  }, [fieldErrors]);

  const handleLogin = useCallback(async () => {
    // Validate both fields before login
    const emailError = validateEmailField(email);
    const passwordError = validatePasswordField(password);

    if (emailError || passwordError) {
      Alert.alert(
        "Validación requerida",
        "Por favor corrige los errores en el formulario",
      );
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
  }, [
    email,
    password,
    login,
    error,
    validateEmailField,
    validatePasswordField,
  ]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    fieldErrors,
    hasErrors,
    handleLogin,
  };
}

export default useLoginForm;

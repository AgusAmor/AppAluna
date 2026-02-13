import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../services/firebase/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Listen for authentication state changes
   * When user logs in/out, fetch their custom claims (role)
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Get custom claims to check if user is admin
          const idTokenResult = await currentUser.getIdTokenResult();
          const isAdmin = idTokenResult.claims.admin === true;

          // Fetch user document for additional info
          const userDocRef = doc(firestore, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          const userData = userDocSnap.exists() ? userDocSnap.data() : {};

          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            isAdmin,
            ...userData,
          });

          setUserRole(isAdmin ? "admin" : "user");
          setError(null);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Check if current user is admin
   */
  const isAdmin = () => {
    return user?.isAdmin === true;
  };

  /**
   * Get current user's ID token for API calls
   */
  const getToken = async () => {
    if (!user) return null;
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return await currentUser.getIdToken();
  };

  const value = {
    user,
    userRole,
    loading,
    error,
    login,
    logout,
    isAdmin,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

/**
 * Translate Firebase error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode) {
  const messages = {
    "auth/user-not-found": "Usuario no encontrado",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/invalid-email": "Email inválido",
    "auth/user-disabled": "Usuario deshabilitado",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde",
  };

  return messages[errorCode] || "Error de autenticación";
}

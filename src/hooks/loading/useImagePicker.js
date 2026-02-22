/**
 * useImagePicker.js
 * Custom hook for handling image selection from camera or gallery
 * Uses expo-image-picker which comes with Expo
 * Fixed for Android compatibility
 */

import { useState, useCallback } from "react";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

/**
 * Convert image URI to base64
 * @param {string} uri - Image URI
 * @returns {Promise<string>} Base64 string
 */
async function uriToBase64(uri) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
}

export function useImagePicker() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Request camera permission
   */
  const requestCameraPermission = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      return false;
    }
  }, []);

  /**
   * Request gallery permission
   */
  const requestGalleryPermission = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting gallery permission:", error);
      return false;
    }
  }, []);

  /**
   * Launch camera to take photo
   * @returns {Promise<string|null>} Image URI or null if cancelled
   */
  const launchCamera = useCallback(async () => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se necesita acceso a la cámara para tomar fotos",
        );
        return null;
      }

      setIsLoading(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS === "ios", // Disable editing on Android
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      setIsLoading(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      setIsLoading(false);
      console.error("Error launching camera:", error);
      Alert.alert("Error", "No se pudo acceder a la cámara");
      return null;
    }
  }, []);

  /**
   * Launch gallery to pick image
   * @returns {Promise<string|null>} Image URI or null if cancelled
   */
  const launchGallery = useCallback(async () => {
    try {
      // Request permission first
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se necesita acceso a la galería para seleccionar imágenes",
        );
        return null;
      }

      setIsLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS === "ios", // Disable editing on Android
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      setIsLoading(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      setIsLoading(false);
      console.error("Error launching gallery:", error);
      Alert.alert("Error", "No se pudo acceder a la galería");
      return null;
    }
  }, []);

  return {
    launchCamera,
    launchGallery,
    isLoading,
    uriToBase64,
  };
}

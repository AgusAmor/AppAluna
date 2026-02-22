/**
 * useProductEdit.js
 * Custom hook for managing product edit form state and persistence
 * Handles: edit form state management, modal visibility, save logic, API calls, image handling
 * Returns: editForm, setEditForm, showEditModal, openEditModal(), closeEditModal(), isSaving, handleSaveProduct(), imagePreview, setImagePreview()
 */

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { saveProductChanges } from "../../../services/products";
import {
  uploadProductImageMobile,
  replaceProductImageMobile,
} from "../../../services/firebase/firebaseProductService";
import { validateRequired } from "../../../utils/validationService";
import { useImagePicker } from "../../loading/useImagePicker";

/**
 * Validates form data before saving
 * Uses validation utilities from validationService
 * @param {Object} formData - Form data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateProductForm(formData) {
  const errors = [];

  // Validate name
  const nameError = validateRequired(formData.name, "El nombre");
  if (nameError) errors.push(nameError);

  // Validate description
  const descriptionError = validateRequired(
    formData.description,
    "La descripción",
  );
  if (descriptionError) errors.push(descriptionError);

  // Validate family
  const familyError = validateRequired(formData.family, "La familia");
  if (familyError) errors.push(familyError);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Maps error messages from API to user-friendly Spanish messages
 */
function mapErrorMessage(errorMessage) {
  const errorMap = {
    name: "El nombre del producto no es válido",
    description: "La descripción no es válida",
    family: "La familia no es válida",
    Firebase: "Error al conectar con el servidor",
  };

  for (const [key, friendlyMessage] of Object.entries(errorMap)) {
    if (errorMessage?.toLowerCase().includes(key.toLowerCase())) {
      return friendlyMessage;
    }
  }

  return "Error al actualizar el producto. Por favor, intenta nuevamente";
}

export function useProductEdit() {
  const { user, getToken } = useAuth();
  const {
    launchCamera,
    launchGallery,
    isLoading: isPickingImage,
  } = useImagePicker();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    family: "",
    imageUrl: "",
    pricing: {
      normal: { price: "" },
      small: { price: "" },
    },
    status: "active",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openEditModal = useCallback((product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      family: product.family || "",
      imageUrl: product.imageUrl || "",
      pricing: {
        normal: { price: product.pricing?.normal?.price || "" },
        small: { price: product.pricing?.small?.price || "" },
      },
      status: product.status || "active",
    });
    // Set image preview to existing image or null
    setImagePreview(product.imageUrl || null);
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedProduct(null);
    setImagePreview(null);
    setEditForm({
      name: "",
      description: "",
      family: "",
      imageUrl: "",
      pricing: {
        normal: { price: "" },
        small: { price: "" },
      },
      status: "active",
    });
  }, []);

  const handleTakePhoto = useCallback(async () => {
    const imageUri = await launchCamera();
    if (imageUri) {
      setImagePreview(imageUri);
      setEditForm((prev) => ({
        ...prev,
        imageUrl: imageUri,
      }));
    }
  }, [launchCamera]);

  const handlePickFromGallery = useCallback(async () => {
    const imageUri = await launchGallery();
    if (imageUri) {
      setImagePreview(imageUri);
      setEditForm((prev) => ({
        ...prev,
        imageUrl: imageUri,
      }));
    }
  }, [launchGallery]);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setEditForm((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  }, []);

  const handleSaveProduct = useCallback(async () => {
    if (!selectedProduct) return;

    // Validate form
    const validation = validateProductForm(editForm);
    if (!validation.isValid) {
      Alert.alert("Errores de validación", validation.errors.join("\n"));
      return;
    }

    if (!user) {
      Alert.alert("Error", "Usuario no autenticado");
      return;
    }

    setIsSaving(true);
    try {
      // Get authentication token
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "No se pudo obtener el token de autenticación");
        return;
      }

      // Handle image upload if there's a new image
      let finalImageUrl = editForm.imageUrl || selectedProduct.imageUrl || "";

      // Check if image changed (new URI from image picker, not existing URL)
      const isNewImage =
        imagePreview &&
        (imagePreview.startsWith("file://") ||
          imagePreview.startsWith("content://"));

      if (isNewImage) {
        // Upload new image and get URL
        if (imagePreview) {
          // Replace existing image or upload new one
          if (selectedProduct.imageUrl) {
            finalImageUrl = await replaceProductImageMobile(
              imagePreview,
              selectedProduct.id,
              selectedProduct.imageUrl,
            );
          } else {
            finalImageUrl = await uploadProductImageMobile(
              imagePreview,
              selectedProduct.id,
            );
          }
        }
      }

      // Create update payload with final image URL
      const updatePayload = {
        ...editForm,
        imageUrl: finalImageUrl,
      };

      // Save product to database
      await saveProductChanges(selectedProduct.id, updatePayload, user, token);
      Alert.alert("Éxito", "Producto actualizado correctamente");
      closeEditModal();
    } catch (error) {
      const friendlyMessage = mapErrorMessage(error.message);
      Alert.alert("Error", friendlyMessage);
      console.error("Error saving product:", error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedProduct, editForm, imagePreview, user, getToken, closeEditModal]);

  return {
    editForm,
    setEditForm,
    showEditModal,
    openEditModal,
    closeEditModal,
    isSaving,
    handleSaveProduct,
    selectedProduct,
    imagePreview,
    setImagePreview,
    handleTakePhoto,
    handlePickFromGallery,
    handleRemoveImage,
    isPickingImage,
  };
}

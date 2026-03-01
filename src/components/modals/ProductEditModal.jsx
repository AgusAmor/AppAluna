import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  X,
  Camera,
  Image as ImageIcon,
  Trash2,
  ChevronDown,
} from "lucide-react-native";
import { useThemeColors, fonts } from "../../theme";
import { validateRequired } from "../../utils/validationService";

/**
 * FamilySelect Component
 * Custom dropdown selector for product family (AENOR, CORE)
 */
const FamilySelect = ({ value, onChange, disabled, colorScheme, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { label: "AENOR", value: "AENOR" },
    { label: "CORE", value: "CORE" },
  ];

  const selectedOption = options.find((opt) => opt.value === value);

  const familyStyles = StyleSheet.create({
    button: {
      borderWidth: 1,
      borderColor: hasError ? colorScheme.error : colorScheme.border,
      borderRadius: 10,
      padding: 12,
      backgroundColor: colorScheme.backgroundLight,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      opacity: disabled ? 0.6 : 1,
    },
    buttonText: {
      ...fonts.body.base,
      color: value ? colorScheme.text : colorScheme.textLight,
      fontWeight: "500",
      flex: 1,
    },
    dropdown: {
      borderWidth: 1,
      borderColor: colorScheme.border,
      borderRadius: 10,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      marginTop: -8,
      marginBottom: 16,
      backgroundColor: colorScheme.backgroundLight,
      overflow: "hidden",
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.border + "20",
    },
    optionText: {
      ...fonts.body.base,
      fontWeight: "500",
    },
  });

  return (
    <View>
      <TouchableOpacity
        style={familyStyles.button}
        onPress={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <Text style={familyStyles.buttonText}>
          {selectedOption?.label || "Selecciona familia"}
        </Text>
        <ChevronDown
          size={20}
          color={colorScheme.text}
          style={{ opacity: isOpen ? 0.6 : 1 }}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={familyStyles.dropdown}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                familyStyles.option,
                option.value === value && {
                  backgroundColor: colorScheme.accent + "20",
                },
              ]}
              onPress={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  familyStyles.optionText,
                  {
                    color:
                      option.value === value
                        ? colorScheme.accent
                        : colorScheme.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * ProductEditModal
 * Modal for editing product info (name, description, family, pricing, image)
 * Includes real-time validation for all product fields
 * Allows taking photos or selecting from gallery
 */
const ProductEditModal = ({
  visible,
  onClose,
  product,
  editForm,
  onFormChange,
  onSave,
  onDelete,
  isSaving,
  imagePreview,
  setImagePreview,
  onTakePhoto,
  onPickFromGallery,
  onRemoveImage,
  isPickingImage,
}) => {
  const { colorScheme } = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colorScheme);
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageLoading, setImageLoading] = useState(false);

  // Effect: Validate all fields when modal opens or form changes
  useEffect(() => {
    if (visible) {
      // Validate all required fields
      const newErrors = {};

      if (!editForm?.name?.trim()) newErrors.name = "El nombre es requerido";
      if (!editForm?.description?.trim())
        newErrors.description = "La descripción es requerida";
      if (!editForm?.family?.trim())
        newErrors.family = "La familia es requerida";
      if (!editForm?.pricing?.normal?.price)
        newErrors.priceNormal = "El precio normal es requerido";
      if (!editForm?.pricing?.small?.price)
        newErrors.priceSmall = "El precio small es requerido";
      if (!editForm?.pricing?.normal?.size?.trim())
        newErrors.sizeNormal = "La medida normal es requerida";
      if (!editForm?.pricing?.small?.size?.trim())
        newErrors.sizeSmall = "La medida small es requerida";
      if (!imagePreview) newErrors.image = "La imagen es requerida";

      setFieldErrors(newErrors);
    }
  }, [visible, editForm, imagePreview]);

  // Validate fields in real-time
  const validateField = useCallback((fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case "name":
        error = validateRequired(value, "El nombre");
        break;

      case "description":
        error = validateRequired(value, "La descripción");
        break;

      case "family":
        error = validateRequired(value, "La familia");
        break;

      case "sizeNormal":
      case "sizeSmall":
        // Sizes are required
        error = validateRequired(
          value,
          fieldName === "sizeNormal" ? "La medida normal" : "La medida small",
        );
        break;

      case "priceNormal":
      case "priceSmall":
        // Prices are required and must be valid numbers
        if (!value || value.trim() === "") {
          error =
            fieldName === "priceNormal"
              ? "El precio normal es requerido"
              : "El precio small es requerido";
        } else {
          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue <= 0) {
            error = "El precio debe ser un número válido mayor a 0";
          }
        }
        break;

      case "image":
        // Image is required
        error = !value ? "La imagen es requerida" : null;
        if (error) {
          setFieldErrors((prev) => ({
            ...prev,
            image: error,
          }));
        } else {
          setFieldErrors((prev) => {
            const { image, ...rest } = prev;
            return rest;
          });
        }
        return error;

      default:
        break;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    return error;
  }, []);

  // Handle field changes with validation
  const handleFieldChange = useCallback(
    (fieldName, value) => {
      let newForm = { ...editForm };

      if (fieldName === "priceNormal") {
        newForm = {
          ...editForm,
          pricing: {
            ...editForm.pricing,
            normal: { ...editForm.pricing.normal, price: value },
          },
        };
      } else if (fieldName === "priceSmall") {
        newForm = {
          ...editForm,
          pricing: {
            ...editForm.pricing,
            small: { ...editForm.pricing.small, price: value },
          },
        };
      } else if (fieldName === "sizeNormal") {
        newForm = {
          ...editForm,
          pricing: {
            ...editForm.pricing,
            normal: { ...editForm.pricing.normal, size: value },
          },
        };
      } else if (fieldName === "sizeSmall") {
        newForm = {
          ...editForm,
          pricing: {
            ...editForm.pricing,
            small: { ...editForm.pricing.small, size: value },
          },
        };
      } else {
        newForm[fieldName] = value;
      }

      onFormChange(newForm);
      validateField(fieldName, value);
    },
    [editForm, onFormChange, validateField],
  );

  // Check if form is valid for saving
  const hasErrors = useMemo(() => {
    return Object.values(fieldErrors).some((error) => error !== null);
  }, [fieldErrors]);

  // Check if form is modified
  const isFormModified = useMemo(() => {
    if (!product || !editForm) return false;
    return (
      editForm.name !== (product.name || "") ||
      editForm.description !== (product.description || "") ||
      editForm.family !== (product.family || "") ||
      parseFloat(editForm.pricing?.normal?.price || 0) !==
        parseFloat(product.pricing?.normal?.price || 0) ||
      parseFloat(editForm.pricing?.small?.price || 0) !==
        parseFloat(product.pricing?.small?.price || 0) ||
      (editForm.pricing?.normal?.size || "") !==
        (product.pricing?.normal?.size || "") ||
      (editForm.pricing?.small?.size || "") !==
        (product.pricing?.small?.size || "") ||
      imagePreview !== product.imageUrl
    );
  }, [editForm, product, imagePreview]);

  // Determine if this is a new product or editing an existing one
  const isNewProduct = !product?.id;
  const modalTitle = isNewProduct ? "Agregar Producto" : "Editar Producto";

  if (!visible || !product) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View
        style={[
          styles.modalOverlay,
          {
            paddingTop: Platform.OS === "ios" ? insets.top : 0,
          },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            {
              paddingBottom: Platform.OS === "ios" ? insets.bottom : 20,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSaving}
              style={styles.closeButtonContainer}
            >
              <X color={colorScheme.text} size={24} />
            </TouchableOpacity>
          </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              style={styles.formContainer}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Name Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nombre del Producto *</Text>
                <TextInput
                  style={[styles.input, fieldErrors.name && styles.inputError]}
                  placeholder="Ingresa el nombre"
                  placeholderTextColor={colorScheme.textLight}
                  value={editForm?.name || ""}
                  onChangeText={(value) => handleFieldChange("name", value)}
                  editable={!isSaving}
                  maxLength={100}
                />
                {fieldErrors.name && (
                  <Text style={styles.errorText}>{fieldErrors.name}</Text>
                )}
              </View>

              {/* Description Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Descripción *</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textAreaInput,
                    fieldErrors.description && styles.inputError,
                  ]}
                  placeholder="Ingresa la descripción"
                  placeholderTextColor={colorScheme.textLight}
                  value={editForm?.description || ""}
                  onChangeText={(value) =>
                    handleFieldChange("description", value)
                  }
                  editable={!isSaving}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                {fieldErrors.description && (
                  <Text style={styles.errorText}>
                    {fieldErrors.description}
                  </Text>
                )}
              </View>

              {/* Family Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Familia *</Text>
                <FamilySelect
                  value={editForm?.family || ""}
                  onChange={(value) => handleFieldChange("family", value)}
                  disabled={isSaving}
                  colorScheme={colorScheme}
                  hasError={!!fieldErrors.family}
                />
                {fieldErrors.family && (
                  <Text style={styles.errorText}>{fieldErrors.family}</Text>
                )}
              </View>

              {/* Pricing Section */}
              <View style={styles.pricingSection}>
                <Text style={styles.sectionTitle}>Precios</Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Normal</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={[
                        styles.priceInput,
                        fieldErrors.priceNormal && styles.inputError,
                      ]}
                      placeholder="0.00"
                      placeholderTextColor={colorScheme.textLight}
                      value={String(editForm.pricing?.normal?.price || "")}
                      onChangeText={(value) =>
                        handleFieldChange("priceNormal", value)
                      }
                      editable={!isSaving}
                      keyboardType="decimal-pad"
                      maxLength={10}
                    />
                  </View>
                  {fieldErrors.priceNormal && (
                    <Text style={styles.errorText}>
                      {fieldErrors.priceNormal}
                    </Text>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors.sizeNormal && styles.inputError,
                    ]}
                    placeholder="24cm x 11,5cm x 11,5cm"
                    placeholderTextColor={colorScheme.textLight}
                    value={editForm.pricing?.normal?.size || ""}
                    onChangeText={(value) =>
                      handleFieldChange("sizeNormal", value)
                    }
                    editable={!isSaving}
                    maxLength={100}
                  />
                  {fieldErrors.sizeNormal && (
                    <Text style={styles.errorText}>
                      {fieldErrors.sizeNormal}
                    </Text>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Small</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={[
                        styles.priceInput,
                        fieldErrors.priceSmall && styles.inputError,
                      ]}
                      placeholder="0.00"
                      placeholderTextColor={colorScheme.textLight}
                      value={String(editForm.pricing?.small?.price || "")}
                      onChangeText={(value) =>
                        handleFieldChange("priceSmall", value)
                      }
                      editable={!isSaving}
                      keyboardType="decimal-pad"
                      maxLength={10}
                    />
                  </View>
                  {fieldErrors.priceSmall && (
                    <Text style={styles.errorText}>
                      {fieldErrors.priceSmall}
                    </Text>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <TextInput
                    style={[
                      styles.input,
                      fieldErrors.sizeSmall && styles.inputError,
                    ]}
                    placeholder="17cm x 9,5cm x 9,5cm"
                    placeholderTextColor={colorScheme.textLight}
                    value={editForm.pricing?.small?.size || ""}
                    onChangeText={(value) =>
                      handleFieldChange("sizeSmall", value)
                    }
                    editable={!isSaving}
                    maxLength={100}
                  />
                  {fieldErrors.sizeSmall && (
                    <Text style={styles.errorText}>
                      {fieldErrors.sizeSmall}
                    </Text>
                  )}
                </View>
              </View>

              {/* Image Section */}
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>Imagen del Producto</Text>

                {/* Image Preview */}
                {imagePreview && typeof imagePreview === "string" ? (
                  <View style={styles.imagePreviewContainer}>
                    {imageLoading && (
                      <View
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginLeft: -15,
                          marginTop: -15,
                          zIndex: 10,
                        }}
                      >
                        <ActivityIndicator
                          size="large"
                          color={colorScheme.primary}
                        />
                      </View>
                    )}
                    <Image
                      source={{
                        uri: imagePreview,
                      }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                      onLoadStart={() => setImageLoading(true)}
                      onLoadEnd={() => setImageLoading(false)}
                      onError={(error) => {
                        console.error(
                          "Image loading error:",
                          error,
                          "URI:",
                          imagePreview,
                        );
                        setImageLoading(false);
                      }}
                      progressiveRenderingEnabled={true}
                      defaultSource={{
                        uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                      }}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={onRemoveImage}
                      disabled={isPickingImage || isSaving}
                    >
                      <Trash2 size={20} color={colorScheme.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <ImageIcon
                      size={48}
                      color={colorScheme.textLight}
                      style={styles.imagePlaceholderIcon}
                    />
                    <Text style={styles.imagePlaceholderText}>
                      Sin imagen seleccionada
                    </Text>
                  </View>
                )}

                {/* Image Error Message */}
                {fieldErrors.image && (
                  <Text style={styles.errorText}>{fieldErrors.image}</Text>
                )}

                {/* Image Action Buttons */}
                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.imageActionButton,
                      (isPickingImage || isSaving) && styles.buttonDisabled,
                    ]}
                    onPress={onTakePhoto}
                    disabled={isPickingImage || isSaving}
                  >
                    <Camera size={20} color={colorScheme.background} />
                    <Text style={styles.imageActionButtonText}>Sacar Foto</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.imageActionButton,
                      (isPickingImage || isSaving) && styles.buttonDisabled,
                    ]}
                    onPress={onPickFromGallery}
                    disabled={isPickingImage || isSaving}
                  >
                    <ImageIcon size={20} color={colorScheme.background} />
                    <Text style={styles.imageActionButtonText}>Galería</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {!isNewProduct && (
                <View style={styles.deleteSection}>
                  <Text style={styles.deleteTitle}>Eliminar Producto</Text>
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      isSaving && styles.buttonDisabled,
                    ]}
                    onPress={onDelete}
                    disabled={isSaving}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>

          {/* Action Buttons */}
          <View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, isSaving && styles.buttonDisabled]}
                onPress={onClose}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (isSaving || hasErrors || !isFormModified) &&
                    styles.buttonDisabled,
                ]}
                onPress={onSave}
                disabled={isSaving || hasErrors || !isFormModified}
              >
                {isSaving ? (
                  <ActivityIndicator
                    color={colorScheme.background}
                    size="small"
                  />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colorScheme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 0,
      flex: 1,
      height: "85%",
      shadowColor: colorScheme.primary,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.border + "30",
    },
    closeButtonContainer: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    modalTitle: {
      ...fonts.heading.h3,
      color: colorScheme.text,
      flex: 1,
    },
    formContainer: {
      marginBottom: 20,
      flex: 1,
      minHeight: Platform.OS === "android" ? 300 : undefined,
    },
    scrollContent: {
      paddingVertical: 16,
      paddingBottom: 8,
    },
    fieldGroup: {
      marginBottom: 8,
    },
    label: {
      ...fonts.body.sm,
      color: colorScheme.primary,
      marginBottom: 8,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      borderWidth: 1,
      borderColor: colorScheme.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 14,
      color: colorScheme.text,
      backgroundColor: colorScheme.backgroundLight,
      fontWeight: "500",
    },
    inputError: {
      borderColor: colorScheme.error,
      backgroundColor: colorScheme.error + "08",
    },
    errorText: {
      ...fonts.body.sm,
      color: colorScheme.error,
      marginTop: 4,
      fontWeight: "500",
    },
    textAreaInput: {
      paddingVertical: 12,
      textAlignVertical: "top",
      height: 100,
    },
    pricingSection: {
      marginVertical: 16,
    },
    sectionTitle: {
      ...fonts.heading.h4,
      color: colorScheme.textLight,
      marginBottom: 12,
    },
    priceInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colorScheme.backgroundLight,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colorScheme.border,
      paddingHorizontal: 4,
    },
    currencySymbol: {
      ...fonts.body.base,
      color: colorScheme.text,
      paddingHorizontal: 8,
      fontWeight: "600",
    },
    priceInput: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 12,
      color: colorScheme.text,
      ...fonts.body.base,
      fontWeight: "500",
    },
    modalFooter: {
      flexDirection: "row",
      gap: 12,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colorScheme.border + "30",
    },
    deleteSection: {
      marginBottom: 12,
      marginTop: 32,
    },
    deleteTitle: {
      ...fonts.heading.h3,
      color: colorScheme.error,
      marginBottom: 6,
      textAlign: "center",
    },
    deleteButton: {
      width: "100%",
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colorScheme.error,
      alignItems: "center",
      shadowColor: colorScheme.error,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    deleteButtonText: {
      ...fonts.button,
      color: colorScheme.background,
      fontWeight: "600",
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colorScheme.border,
      alignItems: "center",
      backgroundColor: colorScheme.backgroundLight,
    },
    cancelButtonText: {
      ...fonts.button,
      color: colorScheme.text,
      fontWeight: "600",
    },
    saveButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      backgroundColor: colorScheme.primary,
      alignItems: "center",
      shadowColor: colorScheme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    saveButtonText: {
      ...fonts.button,
      color: colorScheme.background,
      fontWeight: "600",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    imageSection: {
      marginVertical: 8,
    },
    imagePreviewContainer: {
      position: "relative",
      width: "100%",
      height: 200,
      backgroundColor: colorScheme.backgroundLight,
      borderRadius: 10,
      overflow: "hidden",
    },
    imagePreview: {
      width: "100%",
      height: "100%",
    },
    removeImageButton: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: colorScheme.background,
      borderRadius: 8,
      padding: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    imagePlaceholder: {
      width: "100%",
      height: 140,
      backgroundColor: colorScheme.backgroundLight,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colorScheme.border,
      borderStyle: "dashed",
    },
    imagePlaceholderIcon: {
      marginBottom: 8,
    },
    imagePlaceholderText: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      fontWeight: "500",
    },
    imageButtonsContainer: {
      flexDirection: "row",
      gap: 10,
      marginTop: 8,
    },
    imageActionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colorScheme.primary,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 8,
    },
    imageActionButtonText: {
      ...fonts.body.sm,
      color: colorScheme.background,
      fontWeight: "600",
    },
  });

export default ProductEditModal;

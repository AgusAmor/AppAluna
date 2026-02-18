import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useThemeColors, fonts } from "../../theme";
import {
  validateRequired,
  isValidContactPhone,
  validatePhoneMinDigits,
  validateLength,
} from "../../utils/validationService";
import {
  getFilterForField,
  getMaxLengthForField,
} from "../../utils/inputFilters";

/**
 * AddressEditModal
 * Modal for creating or editing a single address
 * Includes real-time validation for all address fields
 */
const AddressEditModal = ({
  visible,
  onClose,
  isNew,
  address,
  onAddressChange,
  onSave,
}) => {
  const { colorScheme } = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colorScheme);
  const [fieldErrors, setFieldErrors] = useState({});
  const [validatingFields, setValidatingFields] = useState({});
  const validationTimeoutRef = useRef({});

  // Validate individual fields with debounce (1000ms like WebAluna)
  const validateField = useCallback((fieldName, value) => {
    let error = null;

    // All fields are required
    const fieldLabels = {
      street: "Calle",
      number: "Número",
      city: "Ciudad",
      region: "Región/Barrio",
      postalCode: "Código Postal",
      recipientName: "Nombre del Destinatario",
      recipientPhone: "Teléfono del Destinatario",
    };

    const fieldLabel = fieldLabels[fieldName] || fieldName;
    error = validateRequired(value, fieldLabel);

    if (!error) {
      // Validate field-specific length constraints
      switch (fieldName) {
        case "number":
          // Restrict to 1-9999 like WebAluna
          const numValue = parseInt(value, 10);
          if (isNaN(numValue) || numValue < 1 || numValue > 9999) {
            error = `${fieldLabel} debe estar entre 1 y 9999`;
          } else {
            error = validateLength(value, 1, 4, fieldLabel);
          }
          break;
        case "street":
          error = validateLength(value, 3, 100, fieldLabel);
          break;
        case "city":
          error = validateLength(value, 2, 50, fieldLabel);
          break;
        case "region":
          error = validateLength(value, 2, 50, fieldLabel);
          break;
        case "postalCode":
          error = validateLength(value, 2, 20, fieldLabel);
          break;
        case "recipientName":
          error = validateLength(value, 3, 100, fieldLabel);
          break;
        default:
          break;
      }
    }

    // Additional validation for phone
    if (fieldName === "recipientPhone" && !error) {
      if (!isValidContactPhone(value)) {
        error = "Teléfono inválido. Solo números y símbolos +, -, ( )";
      } else if (!validatePhoneMinDigits(value, 7)) {
        error = "Teléfono debe tener al menos 7 dígitos";
      }
    }

    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    return error;
  }, []);

  // Handle field changes with validation and debounce (1000ms)
  const handleFieldChange = useCallback(
    (fieldName, value) => {
      onAddressChange({ ...address, [fieldName]: value });

      // Clear previous timeout for this field
      if (validationTimeoutRef.current[fieldName]) {
        clearTimeout(validationTimeoutRef.current[fieldName]);
      }

      // Set validating state
      setValidatingFields((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      // Debounce validation by 1000ms (like WebAluna's 1500ms)
      validationTimeoutRef.current[fieldName] = setTimeout(() => {
        validateField(fieldName, value);
        setValidatingFields((prev) => ({
          ...prev,
          [fieldName]: false,
        }));
      }, 1000);
    },
    [address, onAddressChange, validateField],
  );

  // Check if form has errors
  const hasErrors = useMemo(() => {
    return Object.values(fieldErrors).some((error) => error !== null);
  }, [fieldErrors]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  if (!address) return null;

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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isNew ? "Agregar Dirección" : "Editar Dirección"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButtonContainer}
            >
              <X size={24} color={colorScheme.textLight} />
            </TouchableOpacity>
          </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Calle</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.street && styles.inputError,
                  ]}
                  value={address.street}
                  onChangeText={(text) => {
                    const filtered = getFilterForField("street")(text);
                    handleFieldChange("street", filtered);
                  }}
                  maxLength={getMaxLengthForField("street")}
                  placeholder="Nombre de la calle"
                />
                {validatingFields.street && (
                  <ActivityIndicator
                    size="small"
                    color={colorScheme.primary}
                    style={styles.validatingIndicator}
                  />
                )}
              </View>
              {fieldErrors.street && (
                <Text style={styles.errorText}>{fieldErrors.street}</Text>
              )}

              <Text style={styles.label}>Número</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.number && styles.inputError,
                  ]}
                  value={address.number}
                  onChangeText={(text) => {
                    const filtered = getFilterForField("number")(text);
                    handleFieldChange("number", filtered);
                  }}
                  maxLength={getMaxLengthForField("number")}
                  placeholder="Ej: 123, 456, 9999"
                  keyboardType="number-pad"
                />
                {validatingFields.number && (
                  <ActivityIndicator
                    size="small"
                    color={colorScheme.primary}
                    style={styles.validatingIndicator}
                  />
                )}
              </View>
              {fieldErrors.number && (
                <Text style={styles.errorText}>{fieldErrors.number}</Text>
              )}

              <Text style={styles.label}>Ciudad</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, fieldErrors.city && styles.inputError]}
                  value={address.city}
                  onChangeText={(text) => {
                    const filtered = getFilterForField("city")(text);
                    handleFieldChange("city", filtered);
                  }}
                  maxLength={getMaxLengthForField("city")}
                  placeholder="Ciudad"
                />
                {validatingFields.city && (
                  <ActivityIndicator
                    size="small"
                    color={colorScheme.primary}
                    style={styles.validatingIndicator}
                  />
                )}
              </View>
              {fieldErrors.city && (
                <Text style={styles.errorText}>{fieldErrors.city}</Text>
              )}

              <Text style={styles.label}>Barrio/Región</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.region && styles.inputError,
                  ]}
                  value={address.region}
                  onChangeText={(text) => {
                    const filtered = getFilterForField("region")(text);
                    handleFieldChange("region", filtered);
                  }}
                  maxLength={getMaxLengthForField("region")}
                  placeholder="Región o barrio"
                />
                {validatingFields.region && (
                  <ActivityIndicator
                    size="small"
                    color={colorScheme.primary}
                    style={styles.validatingIndicator}
                  />
                )}
              </View>
              {fieldErrors.region && (
                <Text style={styles.errorText}>{fieldErrors.region}</Text>
              )}

              <Text style={styles.label}>Código Postal</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.postalCode && styles.inputError,
                  ]}
                  value={address.postalCode}
                  onChangeText={(text) => {
                    const filtered = getFilterForField("postalCode")(text);
                    handleFieldChange("postalCode", filtered);
                  }}
                  maxLength={getMaxLengthForField("postalCode")}
                  placeholder="Ej: 1425, C1425BHO"
                />
                {validatingFields.postalCode && (
                  <ActivityIndicator
                    size="small"
                    color={colorScheme.primary}
                    style={styles.validatingIndicator}
                  />
                )}
              </View>
              {fieldErrors.postalCode && (
                <Text style={styles.errorText}>{fieldErrors.postalCode}</Text>
              )}

              <Text style={styles.label}>Nombre del Destinatario</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.recipientName && styles.inputError,
                  ]}
                  value={address.recipientName}
                  onChangeText={(text) => {
                    const filtered = getFilterForField("recipientName")(text);
                    handleFieldChange("recipientName", filtered);
                  }}
                  maxLength={getMaxLengthForField("recipientName")}
                  placeholder="Nombre completo"
                />
                {validatingFields.recipientName && (
                  <ActivityIndicator
                    size="small"
                    color={colorScheme.primary}
                    style={styles.validatingIndicator}
                  />
                )}
              </View>
              {fieldErrors.recipientName && (
                <Text style={styles.errorText}>
                  {fieldErrors.recipientName}
                </Text>
              )}

              <Text style={styles.label}>Teléfono del Destinatario</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.recipientPhone && styles.inputError,
                  ]}
                  value={address.recipientPhone}
                  onChangeText={(text) => {
                    const filtered = getFilterForField("recipientPhone")(text);
                    handleFieldChange("recipientPhone", filtered);
                  }}
                  maxLength={getMaxLengthForField("recipientPhone")}
                  placeholder="+54 9 1234567890"
                  keyboardType="phone-pad"
                />
                {validatingFields.recipientPhone && (
                  <ActivityIndicator
                    size="small"
                    color={colorScheme.primary}
                    style={styles.validatingIndicator}
                  />
                )}
              </View>
              {fieldErrors.recipientPhone && (
                <Text style={styles.errorText}>
                  {fieldErrors.recipientPhone}
                </Text>
              )}

              <TouchableOpacity
                style={styles.defaultCheckbox}
                onPress={() =>
                  onAddressChange({
                    ...address,
                    isDefault: !address.isDefault,
                  })
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    address.isDefault && styles.checkboxChecked,
                  ]}
                >
                  {address.isDefault && (
                    <Text style={styles.checkboxText}>✓</Text>
                  )}
                </View>
                <Text style={styles.defaultCheckboxLabel}>
                  Establecer como dirección principal
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableWithoutFeedback>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, hasErrors && styles.buttonDisabled]}
              onPress={onSave}
              disabled={hasErrors}
            >
              <Text style={styles.saveButtonText}>
                {isNew ? "Crear Dirección" : "Guardar Dirección"}
              </Text>
            </TouchableOpacity>
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
      height: "80%",
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
    },
    label: {
      ...fonts.body.sm,
      color: colorScheme.text,
      marginBottom: 8,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    inputWrapper: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colorScheme.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 14,
      marginBottom: 16,
      color: colorScheme.text,
      backgroundColor: colorScheme.backgroundLight,
      fontWeight: "500",
    },
    validatingIndicator: {
      position: "absolute",
      right: 12,
      marginBottom: 16,
    },
    inputError: {
      borderColor: colorScheme.error,
      backgroundColor: colorScheme.error + "08",
    },
    errorText: {
      ...fonts.body.sm,
      color: colorScheme.error,
      marginTop: -12,
      marginBottom: 12,
      fontWeight: "500",
    },
    defaultCheckbox: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: colorScheme.border,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: colorScheme.border,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    checkboxChecked: {
      backgroundColor: colorScheme.primary,
      borderColor: colorScheme.primary,
    },
    checkboxText: {
      ...fonts.body.base,
      color: colorScheme.background,
      fontWeight: "bold",
    },
    defaultCheckboxLabel: {
      ...fonts.body.base,
      color: colorScheme.text,
      fontWeight: "500",
    },
    modalActions: {
      flexDirection: "row",
      gap: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colorScheme.border + "30",
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
  });

export default AddressEditModal;

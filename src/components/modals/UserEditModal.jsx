import React, { useState, useCallback, useMemo } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trash2, X, Plus } from "lucide-react-native";
import { useThemeColors, fonts } from "../../theme";
import {
  validateRequired,
  isValidEmail,
  isValidContactPhone,
  validatePhoneMinDigits,
} from "../../utils/validationService";
import { filterPhone } from "../../utils/inputFilters";

/**
 * UserEditModal
 * Modal for editing user info (name, phone) and managing addresses
 * Includes real-time validation for all user fields
 */
const UserEditModal = ({
  visible,
  onClose,
  user,
  editForm,
  onFormChange,
  onSave,
  isSaving,
  onEditAddress,
  onDeleteAddress,
  onAddAddress,
}) => {
  const { colorScheme } = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colorScheme);
  const [fieldErrors, setFieldErrors] = useState({});

  // Validate fields in real-time
  const validateField = useCallback((fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case "displayName":
        error = validateRequired(value, "El nombre");
        break;

      case "email":
        error = validateRequired(value, "El email");
        if (!error && !isValidEmail(value)) {
          error = "El email no tiene un formato válido";
        }
        break;

      case "phone":
        // Phone is optional
        if (value && value.trim() !== "") {
          if (!isValidContactPhone(value)) {
            error = "Teléfono inválido. Solo números y símbolos +, -, ( )";
          } else if (!validatePhoneMinDigits(value, 7)) {
            error = "Teléfono debe tener al menos 7 dígitos";
          }
        }
        break;

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
      onFormChange({ ...editForm, [fieldName]: value });
      validateField(fieldName, value);
    },
    [editForm, onFormChange, validateField],
  );

  // Check if form is valid for saving
  const hasErrors = useMemo(() => {
    return Object.values(fieldErrors).some((error) => error !== null);
  }, [fieldErrors]);

  if (!user) return null;

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
            <Text style={styles.modalTitle}>Editar Usuario</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButtonContainer}
            >
              <X size={24} color={colorScheme.textLight} />
            </TouchableOpacity>
          </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.displayName && styles.inputError,
                ]}
                value={editForm.displayName}
                onChangeText={(text) => handleFieldChange("displayName", text)}
                placeholder="Nombre"
                editable={!isSaving}
              />
              {fieldErrors.displayName && (
                <Text style={styles.errorText}>{fieldErrors.displayName}</Text>
              )}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, fieldErrors.email && styles.inputError]}
                value={editForm.email}
                onChangeText={(text) =>
                  handleFieldChange("email", text.toLowerCase().trim())
                }
                maxLength={254}
                placeholder="Email"
                keyboardType="email-address"
                editable={!isSaving}
              />
              {fieldErrors.email && (
                <Text style={styles.errorText}>{fieldErrors.email}</Text>
              )}

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={[styles.input, fieldErrors.phone && styles.inputError]}
                value={editForm.phone}
                onChangeText={(text) => {
                  const filtered = filterPhone(text);
                  handleFieldChange("phone", filtered);
                }}
                maxLength={20}
                placeholder="Teléfono (opcional)"
                keyboardType="phone-pad"
                editable={!isSaving}
              />
              {fieldErrors.phone && (
                <Text style={styles.errorText}>{fieldErrors.phone}</Text>
              )}

              {/* Addresses Section */}
              <View style={styles.addressesSection}>
                <View style={styles.addressHeaderRow}>
                  <Text style={styles.label}>Direcciones</Text>
                  <TouchableOpacity
                    style={styles.addAddressButton}
                    onPress={onAddAddress}
                  >
                    <View style={styles.addAddressButtonContent}>
                      <Plus size={16} color={colorScheme.backgroundLight} />
                      <Text style={styles.addAddressButtonText}>Agregar</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {editForm.addresses.length === 0 ? (
                  <Text style={styles.noAddressesText}>
                    Sin direcciones registradas
                  </Text>
                ) : (
                  editForm.addresses.map((address, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.addressCard,
                        address.isDefault
                          ? { borderLeftColor: colorScheme.accent }
                          : { borderLeftColor: colorScheme.primary },
                      ]}
                      onPress={() => onEditAddress(idx)}
                    >
                      <View style={styles.addressCardContent}>
                        <Text style={styles.addressCardStreet}>
                          {address.street} {address.number}
                        </Text>
                        <Text style={styles.addressCardCity}>
                          {address.city}, {address.region} -{" "}
                          {address.postalCode}
                        </Text>
                        <Text style={styles.addressCardRecipient}>
                          {address.recipientName}
                        </Text>
                        <Text style={[styles.addressCardPhone]}>
                          {address.recipientPhone}
                        </Text>
                        {address.isDefault && (
                          <Text style={styles.defaultBadge}>
                            Predeterminada
                          </Text>
                        )}
                      </View>
                      <View style={styles.addressCardActions}>
                        <TouchableOpacity
                          style={styles.deleteAddressButton}
                          onPress={() => onDeleteAddress(idx)}
                        >
                          <Trash2 size={18} color={colorScheme.error} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (isSaving || hasErrors) && styles.buttonDisabled,
              ]}
              onPress={onSave}
              disabled={isSaving || hasErrors}
            >
              {isSaving ? (
                <ActivityIndicator color={colorScheme.background} />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
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
    iosContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
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
      marginBottom: 16,
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
      marginTop: -12,
      marginBottom: 12,
      fontWeight: "500",
    },
    disabledInput: {
      backgroundColor: colorScheme.backgroundLight2,
      color: colorScheme.textLight,
    },
    addressesSection: {
      marginTop: 20,
      marginBottom: 20,
    },
    addressHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    addAddressButton: {
      backgroundColor: colorScheme.accent,
      paddingRight: 14,
      paddingLeft: 10,
      paddingVertical: 8,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    addAddressButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    addAddressButtonText: {
      ...fonts.body.md,
      color: colorScheme.backgroundLight,
      fontWeight: "600",
    },
    noAddressesText: {
      ...fonts.body.base,
      color: colorScheme.textLighter,
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: 16,
    },
    addressCard: {
      backgroundColor: colorScheme.backgroundLight,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderLeftWidth: 4,
      borderLeftColor: colorScheme.primary,
      borderWidth: 1,
      borderColor: colorScheme.border + "40",
    },
    addressCardContent: {
      flex: 1,
    },
    addressCardStreet: {
      ...fonts.body.base,
      fontWeight: "600",
      color: colorScheme.text,
      marginBottom: 4,
    },
    addressCardCity: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      marginBottom: 6,
    },
    addressCardRecipient: {
      ...fonts.body.sm,
      fontWeight: "500",
      color: colorScheme.primary,
      marginBottom: 6,
    },
    addressCardPhone: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      fontWeight: "500",
      marginBottom: 6,
    },
    defaultBadge: {
      ...fonts.body.sm,
      fontWeight: "700",
      color: colorScheme.background,
      backgroundColor: colorScheme.accent,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    addressCardActions: {
      marginLeft: 12,
    },
    deleteAddressButton: {
      padding: 8,
    },
    deleteAddressButtonText: {
      fontSize: 16,
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
    webOverlay: {
      justifyContent: "flex-end",
    },
  });

export default UserEditModal;

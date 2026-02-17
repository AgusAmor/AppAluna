import React from "react";
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
import { Trash2 } from "lucide-react-native";
import { useThemeColors, fonts } from "../../theme";

/**
 * UserEditModal
 * Modal for editing user info (name, phone) and managing addresses
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
  const styles = createStyles(colorScheme);

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === "ios" ? "slide" : "fade"}
      transparent={Platform.OS !== "ios"}
      presentationStyle={
        Platform.OS === "ios" ? "fullScreen" : "overFullScreen"
      }
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          Platform.OS === "web" && styles.webOverlay,
        ]}
      >
        <View
          style={[
            styles.modalContent,
            Platform.OS === "ios" && styles.iosContent,
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Usuario</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={editForm.displayName}
                onChangeText={(text) =>
                  onFormChange({ ...editForm, displayName: text })
                }
                placeholder="Nombre"
                editable={!isSaving}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={user.email}
                editable={false}
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={editForm.phone}
                onChangeText={(text) =>
                  onFormChange({ ...editForm, phone: text })
                }
                placeholder="Teléfono"
                editable={!isSaving}
              />

              {/* Addresses Section */}
              <View style={styles.addressesSection}>
                <View style={styles.addressHeaderRow}>
                  <Text style={styles.label}>Direcciones</Text>
                  <TouchableOpacity
                    style={styles.addAddressButton}
                    onPress={onAddAddress}
                  >
                    <Text style={styles.addAddressButtonText}>+ Agregar</Text>
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
                      style={styles.addressCard}
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
                        <Text style={styles.addressCardPhone}>
                          {address.recipientPhone}
                        </Text>
                        {address.isDefault && (
                          <Text style={styles.defaultBadge}>Principal</Text>
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
              style={[styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={onSave}
              disabled={isSaving}
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
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colorScheme.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 20,
      maxHeight: "90%",
    },
    iosContent: {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      maxHeight: undefined,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    closeButton: {
      ...fonts.body.sm,
      color: colorScheme.textLight,
      fontWeight: "600",
    },
    modalTitle: {
      ...fonts.heading.h2,
      color: colorScheme.text,
      marginBottom: 20,
    },
    formContainer: {
      marginBottom: 20,
    },
    label: {
      ...fonts.body.sm,
      color: colorScheme.text,
      marginBottom: 6,
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: colorScheme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      marginBottom: 16,
      color: colorScheme.text,
      backgroundColor: colorScheme.backgroundLight,
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
      backgroundColor: colorScheme.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    addAddressButtonText: {
      ...fonts.body.sm,
      color: colorScheme.background,
    },
    noAddressesText: {
      ...fonts.body.base,
      color: colorScheme.textLighter,
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: 16,
    },
    addressCard: {
      backgroundColor: colorScheme.backgroundLight2,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderLeftWidth: 3,
      borderLeftColor: colorScheme.primary,
    },
    addressCardContent: {
      flex: 1,
    },
    addressCardStreet: {
      ...fonts.body.base,
      fontWeight: "500",
      color: colorScheme.text,
      marginBottom: 4,
    },
    addressCardCity: {
      fontSize: 12,
      color: colorScheme.textLight,
      marginBottom: 6,
    },
    addressCardRecipient: {
      fontSize: 13,
      fontWeight: "500",
      color: colorScheme.textLight,
      marginBottom: 6,
    },
    addressCardPhone: {
      fontSize: 12,
      color: colorScheme.primary,
      fontWeight: "500",
      marginBottom: 6,
    },
    defaultBadge: {
      fontSize: 11,
      fontWeight: "600",
      color: colorScheme.background,
      backgroundColor: colorScheme.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: "flex-start",
    },
    addressCardActions: {
      marginLeft: 8,
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
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colorScheme.border,
      alignItems: "center",
    },
    cancelButtonText: {
      ...fonts.body.sm,
      color: colorScheme.text,
      fontWeight: "600",
    },
    saveButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colorScheme.primary,
      alignItems: "center",
    },
    saveButtonText: {
      ...fonts.body.sm,
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

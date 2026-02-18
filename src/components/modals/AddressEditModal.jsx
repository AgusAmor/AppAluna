import React from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useThemeColors, fonts } from "../../theme";

/**
 * AddressEditModal
 * Modal for creating or editing a single address
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
              <TextInput
                style={styles.input}
                value={address.street}
                onChangeText={(text) =>
                  onAddressChange({ ...address, street: text })
                }
                placeholder="Nombre de la calle"
              />

              <Text style={styles.label}>Número</Text>
              <TextInput
                style={styles.input}
                value={address.number}
                onChangeText={(text) =>
                  onAddressChange({ ...address, number: text })
                }
                placeholder="Número"
              />

              <Text style={styles.label}>Ciudad</Text>
              <TextInput
                style={styles.input}
                value={address.city}
                onChangeText={(text) =>
                  onAddressChange({ ...address, city: text })
                }
                placeholder="Ciudad"
              />

              <Text style={styles.label}>Barrio</Text>
              <TextInput
                style={styles.input}
                value={address.region}
                onChangeText={(text) =>
                  onAddressChange({ ...address, region: text })
                }
                placeholder="Región o barrio"
              />

              <Text style={styles.label}>Código Postal</Text>
              <TextInput
                style={styles.input}
                value={address.postalCode}
                onChangeText={(text) =>
                  onAddressChange({ ...address, postalCode: text })
                }
                placeholder="Código postal"
              />

              <Text style={styles.label}>Nombre del Destinatario</Text>
              <TextInput
                style={styles.input}
                value={address.recipientName}
                onChangeText={(text) =>
                  onAddressChange({ ...address, recipientName: text })
                }
                placeholder="Nombre completo"
              />

              <Text style={styles.label}>Teléfono del Destinatario</Text>
              <TextInput
                style={styles.input}
                value={address.recipientPhone}
                onChangeText={(text) =>
                  onAddressChange({ ...address, recipientPhone: text })
                }
                placeholder="+54 9 1234567890"
              />

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

            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
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
  });

export default AddressEditModal;

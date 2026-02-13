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
  if (!address) return null;

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
          Platform.OS === "ios" && styles.iosContainer,
        ]}
      >
        <View
          style={[
            styles.modalContent,
            Platform.OS === "ios" && styles.iosContent,
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isNew ? "Agregar Dirección" : "Editar Dirección"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 24,
    color: "#6B7280",
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 0,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    color: "#1F2937",
  },
  defaultCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  checkboxText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  defaultCheckboxLabel: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
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
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  iosContainer: {
    backgroundColor: "transparent",
  },
  iosContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

export default AddressEditModal;

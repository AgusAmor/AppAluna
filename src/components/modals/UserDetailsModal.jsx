import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { useThemeColors, fonts } from "../../theme";

/**
 * UserDetailsModal
 * Displays full user details in read-only mode
 */
const UserDetailsModal = ({
  visible,
  onClose,
  user,
  onEdit,
  formatDate,
  formatUserStatus,
  formatUserRole,
}) => {
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  if (!user) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles del Usuario</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailsContainer}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Nombre</Text>
              <Text style={styles.detailValue}>{user.displayName || "-"}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{user.email}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Teléfono</Text>
              <Text style={styles.detailValue}>{user.phone || "-"}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Rol</Text>
              <Text style={styles.detailValue}>
                {formatUserRole(user.role)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Estado de Cuenta</Text>
              <Text
                style={[
                  styles.detailValue,
                  user.accountStatus === "active"
                    ? styles.statusActive
                    : styles.statusSuspended,
                ]}
              >
                {formatUserStatus(user.accountStatus)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Email Verificado</Text>
              <Text style={styles.detailValue}>
                {user.emailVerified ? "Sí" : "No"}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Pedidos Totales</Text>
              <Text style={styles.detailValue}>{user.totalOrders || 0}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Gasto Total</Text>
              <Text style={styles.detailValue}>
                ${(user.totalSpent || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Creado el</Text>
              <Text style={styles.detailValue}>
                {formatDate(user.createdAt)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Último login</Text>
              <Text style={styles.detailValue}>
                {formatDate(user.lastLoginAt)}
              </Text>
            </View>

            {user.addresses && user.addresses.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>
                  Direcciones ({user.addresses.length})
                </Text>
                {user.addresses.map((addr, idx) => (
                  <Text key={idx} style={styles.addressText}>
                    {addr.recipientName} - {addr.street} {addr.number},{" "}
                    {addr.city}, {addr.region}
                    {addr.isDefault ? " (Principal)" : ""}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Text style={styles.editButtonText}>Editar</Text>
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
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: {
      ...fonts.heading.h2,
      color: colorScheme.text,
    },
    closeButton: {
      fontSize: 24,
      color: colorScheme.textLight,
      fontWeight: "bold",
    },
    detailsContainer: {
      marginBottom: 16,
    },
    detailSection: {
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.border,
    },
    detailLabel: {
      ...fonts.body.xs,
      color: colorScheme.textLight,
      marginBottom: 4,
      textTransform: "uppercase",
    },
    detailValue: {
      fontSize: 16,
      color: colorScheme.text,
      fontWeight: "500",
    },
    statusActive: {
      color: colorScheme.success,
    },
    statusSuspended: {
      color: colorScheme.error,
    },
    addressText: {
      fontSize: 14,
      color: colorScheme.textLight,
      marginTop: 4,
      paddingLeft: 8,
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
      color: colorScheme.text,
      fontSize: 14,
      fontWeight: "600",
    },
    editButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colorScheme.accent,
      alignItems: "center",
    },
    editButtonText: {
      color: colorScheme.background,
      fontSize: 14,
      fontWeight: "600",
    },
  });

export default UserDetailsModal;

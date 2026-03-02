import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useThemeColors, fonts } from "../../theme";
import { firestore } from "../../services/firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

/**
 * UserDetailsModal
 * Displays full user details in read-only mode
 */
const UserDetailsModal = ({
  visible,
  onClose,
  user: userProp,
  onEdit,
  formatDate,
  formatUserStatus,
  formatUserRole,
}) => {
  const { colorScheme } = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colorScheme);
  const [localUser, setLocalUser] = useState(userProp);

  // Reset when a different user is opened
  useEffect(() => {
    setLocalUser(userProp);
  }, [userProp?.id]);

  // Real-time listener — keeps user data up to date from Firebase
  useEffect(() => {
    if (!userProp?.id) return;
    const unsubscribe = onSnapshot(
      doc(firestore, "users", userProp.id),
      (snapshot) => {
        if (snapshot.exists()) {
          setLocalUser({ id: snapshot.id, ...snapshot.data() });
        }
      },
      (err) => console.error("User listener error:", err),
    );
    return () => unsubscribe();
  }, [userProp?.id]);

  if (!localUser) return null;
  // Shadow the prop so all existing references below use live data
  // eslint-disable-next-line no-shadow
  const user = localUser;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      statusBarTranslucent={true}
      onRequestClose={onClose}
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
            <Text style={styles.modalTitle}>Detalles del Usuario</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButtonContainer}
            >
              <X size={24} color={colorScheme.textLight} />
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

            {/* Rol y Estado de Cuenta - lado a lado */}
            <View style={styles.detailRowContainer}>
              <View style={[styles.detailSection, styles.detailHalf]}>
                <Text style={styles.detailLabel}>Rol</Text>
                <Text style={styles.detailValue}>
                  {formatUserRole(user.role)}
                </Text>
              </View>

              <View style={[styles.detailSection, styles.detailHalf]}>
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
            </View>

            {/* Pedidos Realizados y Gasto Total - lado a lado */}
            <View style={styles.detailRowContainer}>
              <View style={[styles.detailSection, styles.detailHalf]}>
                <Text style={styles.detailLabel}>Pedidos Realizados</Text>
                <Text style={styles.detailValue}>{user.totalOrders || 0}</Text>
              </View>

              <View style={[styles.detailSection, styles.detailHalf]}>
                <Text style={[styles.detailLabel]}>Gasto Total</Text>
                <Text
                  style={[styles.detailValue, { color: colorScheme.accent }]}
                >
                  ${(user.totalSpent || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Creado el y Último login - lado a lado */}
            <View style={styles.detailRowContainer}>
              <View style={[styles.detailSection, styles.detailHalf]}>
                <Text style={styles.detailLabel}>Creado el</Text>
                <Text style={styles.detailValue}>
                  {formatDate(user.createdAt)}
                </Text>
              </View>

              <View style={[styles.detailSection, styles.detailHalf]}>
                <Text style={styles.detailLabel}>Último login</Text>
                <Text style={styles.detailValue}>
                  {formatDate(user.lastLoginAt)}
                </Text>
              </View>
            </View>

            {user.addresses && user.addresses.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>
                  Direcciones ({user.addresses.length})
                </Text>
                {user.addresses.map((addr, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.addressText,
                      addr.isDefault
                        ? styles.addressTextDefault
                        : styles.addressTextNormal,
                    ]}
                  >
                    {addr.street} {addr.number}, {addr.region} | {addr.city}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cerrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(user)}
            >
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
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colorScheme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 0,
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
      marginBottom: 24,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.border + "30",
    },
    modalTitle: {
      ...fonts.heading.h3,
      color: colorScheme.text,
      flex: 1,
    },
    closeButtonContainer: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    detailsContainer: {
      marginBottom: 16,
      flex: 1,
    },
    detailRowContainer: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
    },
    detailHalf: {
      flex: 1,
      marginBottom: 16,
      paddingBottom: 0,
      borderBottomWidth: 0,
    },
    detailSection: {
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.border + "40",
    },
    detailLabel: {
      ...fonts.body.sm,
      color: colorScheme.primary,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontWeight: "600",
    },
    detailValue: {
      ...fonts.body.base,
      color: colorScheme.text,
      fontWeight: "500",
      lineHeight: 20,
    },
    statusActive: {
      color: colorScheme.success,
      fontWeight: "600",
    },
    statusSuspended: {
      color: colorScheme.error,
      fontWeight: "600",
    },
    addressText: {
      ...fonts.body.md,
      color: colorScheme.textLight,
      marginTop: 6,
      paddingLeft: 12,
      marginBottom: 8,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: colorScheme.backgroundLight,
      borderRadius: 8,
      borderLeftWidth: 3,
    },
    addressTextDefault: {
      borderLeftColor: colorScheme.accent,
    },
    addressTextNormal: {
      borderLeftColor: colorScheme.primary,
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
    editButton: {
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
    editButtonText: {
      ...fonts.button,
      color: colorScheme.background,
      fontWeight: "600",
    },
  });

export default UserDetailsModal;

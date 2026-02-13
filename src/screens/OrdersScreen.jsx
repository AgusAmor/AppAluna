import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { useAuth } from "../context/AuthContext";

const OrdersScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Gestión de Pedidos</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Órdenes</Text>
        <Text style={styles.placeholderSubtext}>
          Aquí irá la lista de órdenes
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OrdersScreen;

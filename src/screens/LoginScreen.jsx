import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import { useAuth } from "../context/AuthContext";
import { useThemeColors, fonts } from "../theme";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // No need to show alert - navigation will handle redirect
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert(
        "Error de Login",
        err.message || error || "Error desconocido",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer backgroundColor={colorScheme.backgroundLight2} centered>
      <View style={styles.card}>
        <Text style={styles.title}>Panel Admin</Text>
        <Text style={styles.subtitle}>Aluna e-commerce</Text>

        <TextInput
          style={[styles.input, { color: colorScheme.text }]}
          placeholder="Email"
          placeholderTextColor={colorScheme.textLighter}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { color: colorScheme.text }]}
          placeholder="Contraseña"
          placeholderTextColor={colorScheme.textLighter}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colorScheme.background} />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const createStyles = (colorScheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: colorScheme.background,
      borderRadius: 12,
      padding: 24,
      width: "100%",
      maxWidth: 400,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
    },
    title: {
      ...fonts.heading.h2,
      color: colorScheme.text,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      ...fonts.body.base,
      color: colorScheme.textLight,
      marginBottom: 24,
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: colorScheme.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
    },
    button: {
      backgroundColor: colorScheme.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 20,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colorScheme.background,
      fontSize: 16,
      fontWeight: "600",
    },
    error: {
      color: colorScheme.error,
      fontSize: 14,
      marginBottom: 12,
      textAlign: "center",
    },
  });

export default LoginScreen;

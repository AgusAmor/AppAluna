import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import ScreenContainer from "../components/ui/ScreenContainer";
import { useLoginForm } from "../hooks";
import { useThemeColors, fonts } from "../theme";

const LoginScreen = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    fieldErrors,
    hasErrors,
    handleLogin,
  } = useLoginForm();
  const { colorScheme } = useThemeColors();
  const styles = createStyles(colorScheme);

  return (
    <ScreenContainer backgroundColor={colorScheme.backgroundLight2} centered>
      <View style={styles.card}>
        <Text style={styles.title}>Panel Admin</Text>
        <Text style={styles.subtitle}>Aluna e-commerce</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            { color: colorScheme.text },
            fieldErrors.email && styles.inputError,
          ]}
          placeholder="Email"
          placeholderTextColor={colorScheme.textLighter}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
          keyboardType="email-address"
        />
        {fieldErrors.email && (
          <Text style={styles.errorText}>{fieldErrors.email}</Text>
        )}

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={[
            styles.input,
            { color: colorScheme.text },
            fieldErrors.password && styles.inputError,
          ]}
          placeholder="Contraseña"
          placeholderTextColor={colorScheme.textLighter}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        {fieldErrors.password && (
          <Text style={styles.errorText}>{fieldErrors.password}</Text>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[
            styles.button,
            (loading || hasErrors) && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading || hasErrors}
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
    label: {
      ...fonts.body.md,
      color: colorScheme.primary,
      marginBottom: 8,
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: colorScheme.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
    },
    inputError: {
      borderColor: colorScheme.error,
      backgroundColor: colorScheme.error + "08",
      padding: 12,
    },
    errorText: {
      ...fonts.body.sm,
      color: colorScheme.error,
      marginTop: -12,
      marginBottom: 12,
      fontWeight: "500",
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
      ...fonts.button,
      color: colorScheme.background,
    },
    error: {
      ...fonts.body.base,
      color: colorScheme.error,
      marginBottom: 12,
      textAlign: "center",
    },
  });

export default LoginScreen;

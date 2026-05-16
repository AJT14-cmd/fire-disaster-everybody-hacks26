import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { EmergencyButton } from "../components/EmergencyButton";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export function LoginScreen({ navigation }: any) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onLogin() {
    try {
      await login(email, password);
      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    }
  }

  async function onRegister() {
    try {
      await register(email, password);
      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Registration failed", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Account Access</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <EmergencyButton label="Login" kind="accent" onPress={onLogin} />
      <EmergencyButton label="Create Account" kind="warning" onPress={onRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  heading: { color: colors.text, fontSize: 28, fontWeight: "800", marginBottom: 20 },
  input: {
    backgroundColor: colors.panel,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12
  }
});

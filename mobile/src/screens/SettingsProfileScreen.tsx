import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmergencyButton } from "../components/EmergencyButton";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export function SettingsProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings & Profile</Text>
      <Text style={styles.row}>Email: {user?.email ?? "N/A"}</Text>
      <Text style={styles.row}>Accessibility: High contrast mode enabled</Text>
      <Text style={styles.row}>Offline cache: Last route and contacts retained</Text>
      <EmergencyButton label="Logout" kind="warning" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", marginBottom: 12 },
  row: { color: colors.text, marginBottom: 8 }
});

import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { EmergencyButton } from "../components/EmergencyButton";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { colors } from "../theme/colors";

export function SettingsProfileScreen() {
  const { user, logout } = useAuth();
  const [alertPhone, setAlertPhone] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/users/profile");
        setAlertPhone(data.alertPhone ?? "");
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function saveAlertPhone() {
    try {
      const { data } = await api.put("/users/profile", { alertPhone });
      setStatus(data.message ?? "Number saved (alerts not active yet).");
    } catch {
      setStatus("Could not save. Check your connection.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings & Profile</Text>
      <Text style={styles.row}>Email: {user?.email ?? "N/A"}</Text>
      <Text style={styles.row}>Offline cache: Last route retained</Text>

      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          <Text style={styles.badge}>Coming soon</Text>
        </View>
        <Text style={styles.hint}>
          Mobile SMS wildfire alerts are not available yet. Save the number you want notified when this
          ships.
        </Text>
        <Text style={styles.subLabel}>Mobile alert number</Text>
        <TextInput
          style={styles.input}
          value={alertPhone}
          onChangeText={setAlertPhone}
          placeholder="+1 555 123 4567"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
        />
        <EmergencyButton label="Save alert number" kind="accent" onPress={saveAlertPhone} />
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>

      <EmergencyButton label="Logout" kind="warning" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", marginBottom: 12 },
  row: { color: colors.text, marginBottom: 8 },
  card: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 14,
    marginVertical: 12
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  sectionTitle: { color: colors.text, fontWeight: "700", fontSize: 16 },
  badge: {
    color: "#ffcc00",
    fontSize: 10,
    fontWeight: "800",
    backgroundColor: "#3d3520",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden"
  },
  hint: { color: colors.muted, marginBottom: 10, fontSize: 13, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#2a3140" },
  subLabel: { color: colors.text, fontWeight: "600", marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  status: { color: "#30d158", marginTop: 8, fontSize: 13 }
});

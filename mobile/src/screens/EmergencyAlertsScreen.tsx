import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { EmergencyButton } from "../components/EmergencyButton";
import { api } from "../services/api";
import { colors } from "../theme/colors";

export function EmergencyAlertsScreen() {
  async function sendTestAlert() {
    try {
      await api.post("/alerts/send", {
        severity: "critical",
        message: "FirePath Alert: Fire front shifted. Evacuate immediately.",
        sendSms: true,
        sendPush: true
      });
      Alert.alert("Alert sent", "Test emergency alert dispatched.");
    } catch {
      Alert.alert("Error", "Unable to send alert.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Alerts</Text>
      <Text style={styles.subtitle}>Push and SMS delivery for wildfire updates.</Text>
      <EmergencyButton label="Send Test Emergency Alert" kind="danger" onPress={sendTestAlert} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900" },
  subtitle: { color: colors.muted, marginTop: 8, marginBottom: 20 }
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function RiskCard({
  riskScore,
  confidence,
  etaMinutes
}: {
  riskScore: number;
  confidence: number;
  etaMinutes: number;
}) {
  const level = riskScore > 0.7 ? "HIGH" : riskScore > 0.4 ? "MEDIUM" : "LOW";
  const tone = riskScore > 0.7 ? colors.danger : riskScore > 0.4 ? colors.warning : colors.safe;
  return (
    <View style={[styles.card, { borderColor: tone }]}>
      <Text style={styles.title}>Current Wildfire Risk</Text>
      <Text style={[styles.level, { color: tone }]}>{level}</Text>
      <Text style={styles.meta}>Risk score: {(riskScore * 100).toFixed(1)}%</Text>
      <Text style={styles.meta}>Confidence: {(confidence * 100).toFixed(1)}%</Text>
      <Text style={styles.meta}>Estimated arrival: {etaMinutes} min</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14
  },
  title: { color: colors.text, fontWeight: "700", fontSize: 16 },
  level: { marginTop: 8, fontSize: 26, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: 4 }
});

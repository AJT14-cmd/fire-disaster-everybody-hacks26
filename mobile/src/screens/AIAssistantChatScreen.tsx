import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { EmergencyButton } from "../components/EmergencyButton";
import { api } from "../services/api";
import { colors } from "../theme/colors";

const QUICK_PROMPTS = [
  "Am I in danger?",
  "What is the nearest shelter?",
  "How long until the fire reaches me?",
  "What should I pack before evacuating?"
];

export function AIAssistantChatScreen() {
  const [prompt, setPrompt] = useState(QUICK_PROMPTS[0]);
  const [answer, setAnswer] = useState("Ask FirePath AI for emergency guidance.");

  async function ask() {
    try {
      const { data } = await api.post("/fire/predict", {
        latitude: 34.05,
        longitude: -118.24,
        temperature_c: 34,
        humidity_pct: 20,
        wind_speed_kph: 30,
        vegetation_dryness_index: 0.83
      });
      setAnswer(
        `Risk ${(data.risk_score * 100).toFixed(1)}% (confidence ${(data.confidence * 100).toFixed(
          0
        )}%). Spread ${data.spread_direction}, ETA ${data.estimated_arrival_minutes} min.`
      );
    } catch {
      Alert.alert("Assistant unavailable", "Could not retrieve guidance.");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Safety Assistant</Text>
      <TextInput
        style={styles.input}
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Ask an emergency question..."
        placeholderTextColor={colors.muted}
      />
      <EmergencyButton label="Ask Assistant" kind="accent" onPress={ask} />
      <View style={styles.answerCard}>
        <Text style={styles.answer}>{answer}</Text>
      </View>
      <Text style={styles.quickTitle}>Quick prompts</Text>
      {QUICK_PROMPTS.map((item) => (
        <Text key={item} style={styles.quickItem}>
          - {item}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", marginBottom: 12 },
  input: {
    backgroundColor: colors.panel,
    color: colors.text,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  answerCard: { backgroundColor: colors.panel, borderRadius: 12, padding: 12, marginTop: 12 },
  answer: { color: colors.text },
  quickTitle: { color: colors.text, marginTop: 14, fontWeight: "700" },
  quickItem: { color: colors.muted, marginTop: 4 }
});

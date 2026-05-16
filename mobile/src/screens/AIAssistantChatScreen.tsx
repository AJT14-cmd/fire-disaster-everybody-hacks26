import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Location from "expo-location";
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
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("Ask FirePath AI for emergency guidance.");
  const [loading, setLoading] = useState(false);

  async function getCoords() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return { lat: 47.656, lng: -122.317 };
    }
    const pos = await Location.getCurrentPositionAsync({});
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  }

  async function ask(question: string) {
    const text = question.trim();
    if (!text) return;

    setLoading(true);
    setPrompt(text);

    try {
      const { lat, lng } = await getCoords();
      const { data } = await api.post("/assistant/chat", { question: text, lat, lng });
      setAnswer(data.answer);
    } catch {
      Alert.alert("Assistant unavailable", "Could not retrieve guidance.");
    } finally {
      setLoading(false);
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
      <EmergencyButton label={loading ? "Thinking…" : "Ask Assistant"} kind="accent" onPress={() => ask(prompt)} />
      <View style={styles.answerCard}>
        <Text style={styles.answer}>{answer}</Text>
      </View>
      <Text style={styles.quickTitle}>Quick prompts</Text>
      {QUICK_PROMPTS.map((item) => (
        <Text key={item} style={styles.quickItem} onPress={() => ask(item)}>
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

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmergencyButton } from "../components/EmergencyButton";
import { colors } from "../theme/colors";

export function LandingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FirePath AI</Text>
      <Text style={styles.subtitle}>Predict danger. Route safely. Stay informed.</Text>
      <EmergencyButton label="Get Started" kind="accent" onPress={() => navigation.navigate("Login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: 24 },
  title: { color: colors.text, fontSize: 38, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 18, marginTop: 12, marginBottom: 28 }
});

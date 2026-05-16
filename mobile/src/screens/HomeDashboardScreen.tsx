import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { EmergencyButton } from "../components/EmergencyButton";
import { RiskCard } from "../components/RiskCard";
import { api } from "../services/api";
import { getCurrentPosition } from "../services/location";
import { colors } from "../theme/colors";

export function HomeDashboardScreen({ navigation }: any) {
  const [risk, setRisk] = useState({ risk_score: 0.3, confidence: 0.6, estimated_arrival_minutes: 180 });

  useEffect(() => {
    (async () => {
      try {
        const location = await getCurrentPosition();
        const { data } = await api.post("/fire/predict", {
          latitude: location.lat,
          longitude: location.lng,
          temperature_c: 32,
          humidity_pct: 18,
          wind_speed_kph: 26,
          vegetation_dryness_index: 0.81
        });
        setRisk(data);
      } catch (error: any) {
        Alert.alert("Warning", "Could not refresh live risk data.");
      }
    })();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Emergency Dashboard</Text>
      <RiskCard
        riskScore={risk.risk_score}
        confidence={risk.confidence}
        etaMinutes={risk.estimated_arrival_minutes}
      />
      <View style={styles.gap} />
      <EmergencyButton label="Live Fire Map" kind="warning" onPress={() => navigation.navigate("Map")} />
      <EmergencyButton label="Find Safe Route" kind="accent" onPress={() => navigation.navigate("Routes")} />
      <EmergencyButton label="AI Safety Assistant" kind="safe" onPress={() => navigation.navigate("Assistant")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18 },
  heading: { color: colors.text, fontSize: 26, fontWeight: "900", marginBottom: 14 },
  gap: { height: 14 }
});

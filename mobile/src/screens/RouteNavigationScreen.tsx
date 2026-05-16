import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { EmergencyButton } from "../components/EmergencyButton";
import { api } from "../services/api";
import { cacheJson, readCachedJson } from "../services/offlineCache";
import { colors } from "../theme/colors";

export function RouteNavigationScreen() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    readCachedJson<any>("lastRoute").then((cached) => {
      if (cached) setResult(cached);
    });
  }, []);

  async function computeRoute() {
    try {
      const { data } = await api.post("/routes/evacuation", {
        origin: { lat: 34.05, lng: -118.24 },
        destinations: [
          { lat: 34.0, lng: -118.1, name: "Shelter A", trafficFactor: 1.1 },
          { lat: 33.98, lng: -118.18, name: "Shelter B", trafficFactor: 0.95 }
        ],
        riskZones: [{ center: { lat: 34.1, lng: -118.3 }, radiusKm: 8, severity: 0.85 }]
      });
      setResult(data.best);
      await cacheJson("lastRoute", data.best);
    } catch (error: any) {
      Alert.alert("Routing failed", "Unable to calculate evacuation route.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Evacuation Routing</Text>
      <EmergencyButton label="Calculate Safe Route" kind="accent" onPress={computeRoute} />
      {result ? (
        <View style={styles.panel}>
          <Text style={styles.text}>Destination: {result.destination?.name ?? "Unknown shelter"}</Text>
          <Text style={styles.text}>ETA: {result.etaMinutes} min</Text>
          <Text style={styles.text}>Distance: {result.distanceKm} km</Text>
          <Text style={styles.text}>Risk penalty: {result.riskPenalty}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", marginBottom: 14 },
  panel: { marginTop: 14, backgroundColor: colors.panel, borderRadius: 12, padding: 12 },
  text: { color: colors.text, marginBottom: 6 }
});

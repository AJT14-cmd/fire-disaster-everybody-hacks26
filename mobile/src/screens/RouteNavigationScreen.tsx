import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { EmergencyButton } from "../components/EmergencyButton";
import { OpenStreetMapView } from "../components/OpenStreetMapView";
import { api } from "../services/api";
import { cacheJson, readCachedJson } from "../services/offlineCache";
import { colors } from "../theme/colors";

const DEFAULT_REGION = {
  latitude: 34.0522,
  longitude: -118.2437,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35
};

export function RouteNavigationScreen() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    readCachedJson<any>("lastRoute").then((cached) => {
      if (cached) setResult(cached);
    });
  }, []);

  const routeCoordinates = useMemo(() => {
    const geometry = result?.geometry ?? [];
    return geometry.map((point: { lat: number; lng: number }) => ({
      latitude: point.lat,
      longitude: point.lng
    }));
  }, [result]);

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
    } catch {
      Alert.alert("Routing failed", "Unable to calculate evacuation route.");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Smart Evacuation Routing</Text>
      <Text style={styles.subtitle}>Powered by OpenStreetMap + OSRM</Text>
      <EmergencyButton label="Calculate Safe Route" kind="accent" onPress={computeRoute} />
      <OpenStreetMapView
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        routes={routeCoordinates.length ? [routeCoordinates] : []}
      />
      {result ? (
        <View style={styles.panel}>
          <Text style={styles.text}>Destination: {result.destination?.name ?? "Unknown shelter"}</Text>
          <Text style={styles.text}>ETA: {result.etaMinutes} min</Text>
          <Text style={styles.text}>Distance: {result.distanceKm} km</Text>
          <Text style={styles.text}>Risk penalty: {result.riskPenalty}</Text>
          <Text style={styles.text}>Router: {result.routingProvider ?? "heuristic"}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900" },
  subtitle: { color: colors.muted, marginTop: 4, marginBottom: 14 },
  map: { height: 260, borderRadius: 12, overflow: "hidden", marginTop: 12 },
  panel: { marginTop: 14, backgroundColor: colors.panel, borderRadius: 12, padding: 12 },
  text: { color: colors.text, marginBottom: 6 }
});

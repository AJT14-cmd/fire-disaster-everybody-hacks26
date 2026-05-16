import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { colors } from "../theme/colors";

export function LiveFireMapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 34.0522,
          longitude: -118.2437,
          latitudeDelta: 0.25,
          longitudeDelta: 0.25
        }}
      >
        <Marker coordinate={{ latitude: 34.0522, longitude: -118.2437 }} title="Your Location" />
        <Circle
          center={{ latitude: 34.12, longitude: -118.3 }}
          radius={4000}
          fillColor="rgba(255,59,48,0.25)"
          strokeColor="rgba(255,59,48,0.8)"
        />
      </MapView>
      <View style={styles.legend}>
        <Text style={styles.legendText}>Red zones: high wildfire danger</Text>
        <Text style={styles.legendText}>Orange zones: smoke risk</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },
  legend: { backgroundColor: colors.panel, padding: 12 },
  legendText: { color: colors.text, marginBottom: 4 }
});

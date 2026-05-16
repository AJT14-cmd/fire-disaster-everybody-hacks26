import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  label: string;
  onPress: () => void;
  kind?: "danger" | "warning" | "accent" | "safe";
};

export function EmergencyButton({ label, onPress, kind = "danger" }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, { backgroundColor: colors[kind] }]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 14,
    marginVertical: 6
  },
  label: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700"
  }
});

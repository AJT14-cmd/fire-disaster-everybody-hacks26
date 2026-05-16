import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function EmergencyContactsScreen() {
  const contacts = [
    { name: "Sam Rivera", phone: "+1 555-0101" },
    { name: "Morgan Lee", phone: "+1 555-0102" }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      {contacts.map((contact) => (
        <View key={contact.phone} style={styles.card}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.phone}>{contact.phone}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", marginBottom: 12 },
  card: { backgroundColor: colors.panel, borderRadius: 12, padding: 12, marginBottom: 10 },
  name: { color: colors.text, fontSize: 16, fontWeight: "700" },
  phone: { color: colors.muted, marginTop: 4 }
});

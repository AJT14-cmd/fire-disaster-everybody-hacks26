import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={DarkTheme}>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

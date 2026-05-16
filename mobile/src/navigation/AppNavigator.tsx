import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { AIAssistantChatScreen } from "../screens/AIAssistantChatScreen";
import { HomeDashboardScreen } from "../screens/HomeDashboardScreen";
import { LandingScreen } from "../screens/LandingScreen";
import { LiveFireMapScreen } from "../screens/LiveFireMapScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RouteNavigationScreen } from "../screens/RouteNavigationScreen";
import { SettingsProfileScreen } from "../screens/SettingsProfileScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Dashboard" component={HomeDashboardScreen} />
      <Tabs.Screen name="Map" component={LiveFireMapScreen} />
      <Tabs.Screen name="Routes" component={RouteNavigationScreen} />
      <Tabs.Screen name="Assistant" component={AIAssistantChatScreen} />
      <Tabs.Screen name="Settings" component={SettingsProfileScreen} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
// Import icon dari lucide-react-native
import { ListChecks, Timer, Archive, User } from "lucide-react-native";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = "#5A4FCF"; // Warna ungu sesuai gambar
  const inactiveColor = "#9E9E9E";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 85,
          paddingBottom: 15,
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: "#FFFFFF",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 5,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "TASKS",
          tabBarIcon: ({ color }) => (
            <ListChecks size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />

      <Tabs.Screen
        name="focus"
        options={{
          title: "FOCUS",
          tabBarIcon: ({ color }) => (
            <Timer size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />

      <Tabs.Screen
        name="complate"
        options={{
          title: "Arcive",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: focused ? "#EFEEFF" : "transparent" },
              ]}
            >
              <Archive
                size={24}
                color={focused ? activeColor : color}
                strokeWidth={2.5}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "PROFILE",
          tabBarIcon: ({ color }) => (
            <User size={24} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

import { colors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.white,
        tabBarStyle: {
          backgroundColor: "#000000",
        },
      }}
    >
      <Tabs.Screen name="+not-found" options={{ headerShown: false }} />
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? colors.white : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "À propos",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "alert-circle" : "alert-circle-outline"}
              size={24}
              color={focused ? colors.white : color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

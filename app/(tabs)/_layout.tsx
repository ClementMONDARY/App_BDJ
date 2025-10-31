import { colors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type React from "react";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

function AnimatedTabIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  focused: boolean;
}) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(focused ? -10 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [focused, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={24} color={color} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.iconInactive,
        tabBarStyle: tabStyle,
        tabBarItemStyle: {
          width: 56,
        },
        tabBarIcon: ({ color, focused }) => {
          let name: React.ComponentProps<typeof Ionicons>["name"] = "home";
          if (route.name === "forum")
            name = focused ? "megaphone" : "megaphone-outline";
          else if (route.name === "events")
            name = focused ? "calendar" : "calendar-outline";
          else if (route.name === "alerts")
            name = focused ? "notifications" : "notifications-outline";
          else if (route.name === "admin")
            name = focused ? "shield" : "shield-outline";
          else if (route.name === "index")
            name = focused ? "home" : "home-outline";

          return (
            <AnimatedTabIcon name={name} color={color} focused={focused} />
          );
        },
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="forum" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="alerts" />
      <Tabs.Screen name="admin" />
    </Tabs>
  );
}

const tabStyle = {
  backgroundColor: colors.black,
  height: 100,
  borderTopLeftRadius: 5,
  borderTopRightRadius: 5,
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  paddingTop: 10,
  paddingBottom: 18,
  paddingHorizontal: 10,
  position: "absolute" as const,
};

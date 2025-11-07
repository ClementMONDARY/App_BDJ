import { TabBar } from "@/components/TabBar";
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
    <Tabs tabBar={props => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="forum" options={{ title: "Forum" }} />
      <Tabs.Screen name="events" options={{ title: "Events" }} />
      <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
      <Tabs.Screen name="admin" options={{ title: "Admin" }} />
    </Tabs>
  );
}

import Header from "@/components/Header";

import { Tabs } from "expo-router";
import { TabBar } from "@/components/TabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        header: (props) => <Header {...props} />,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="forum" options={{ title: "Forum" }} />
      <Tabs.Screen name="events" options={{ title: "Events" }} />
      <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
      <Tabs.Screen name="admin" options={{ title: "Admin" }} />
    </Tabs>
  );
}

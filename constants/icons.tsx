import { Ionicons } from "@expo/vector-icons";

export const icon = {
  index: (props: React.ComponentProps<typeof Ionicons>, focused: boolean) => (
    <Ionicons name={focused ? "home" : "home-outline"} {...props} />
  ),
  forum: (props: React.ComponentProps<typeof Ionicons>, focused: boolean) => (
    <Ionicons name={focused ? "megaphone" : "megaphone-outline"} {...props} />
  ),
  events: (props: React.ComponentProps<typeof Ionicons>, focused: boolean) => (
    <Ionicons name={focused ? "calendar" : "calendar-outline"} {...props} />
  ),
  alerts: (props: React.ComponentProps<typeof Ionicons>, focused: boolean) => (
    <Ionicons
      name={focused ? "notifications" : "notifications-outline"}
      {...props}
    />
  ),
  admin: (props: React.ComponentProps<typeof Ionicons>, focused: boolean) => (
    <Ionicons name={focused ? "shield" : "shield-outline"} {...props} />
  ),
};

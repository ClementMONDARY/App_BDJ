import { Ionicons } from "@expo/vector-icons";

export const icon = {
  index: (props: React.ComponentProps<typeof Ionicons>, focused: boolean) => (
    <Ionicons {...props} name={focused ? "home" : "home-outline"} />
  ),
  forum: (props: React.ComponentProps<typeof Ionicons>, focused: boolean) => (
    <Ionicons {...props} name={focused ? "megaphone" : "megaphone-outline"} />
  ),
  events: (props: React.ComponentProps<typeof Ionicons>, focused: boolean) => (
    <Ionicons {...props} name={focused ? "calendar" : "calendar-outline"} />
  ),
  alerts: (props: React.ComponentProps<typeof Ionicons>, focused: boolean) => (
    <Ionicons
      {...props}
      name={focused ? "notifications" : "notifications-outline"}
    />
  ),
  admin: (props: React.ComponentProps<typeof Ionicons>, focused: boolean) => (
    <Ionicons {...props} name={focused ? "shield" : "shield-outline"} />
  ),
};

import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

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
  "thumbs-up": (props: any, focused: boolean) => {
    // Props contains color (e.g. #929292 or primary) and size
    return (
      <Svg
        width={props.size || 18}
        height={props.size || 20}
        viewBox="0 0 18 20"
        fill="none"
      >
        <Path
          d="M11.8359 8.875V3.25C11.8359 2.00736 10.8656 1 9.66873 1H8.58514C7.98669 1 7.50155 1.50368 7.50155 2.125V5.15938C7.50155 5.38148 7.43823 5.59861 7.31956 5.78342L5.51636 8.59158C5.39769 8.77639 5.33437 8.99352 5.33437 9.21562V17.875H8.1363C8.42369 17.875 8.69931 17.9935 8.90252 18.2045L9.35136 18.6705C9.55457 18.8815 9.83019 19 10.1176 19H14.2306C15.3348 19 16.2625 18.1379 16.3845 16.9985L16.9865 11.3735C17.1291 10.0406 16.1242 8.875 14.8326 8.875H11.8359ZM11.8359 8.875H9.66873M2.08359 17.875H5.17183C5.2616 17.875 5.33437 17.7994 5.33437 17.7063V9.04375C5.33437 8.95055 5.2616 8.875 5.17183 8.875H2.08359C1.48514 8.875 1 9.37868 1 10V16.75C1 17.3713 1.48514 17.875 2.08359 17.875Z"
          stroke={props.color}
          strokeWidth="2"
          strokeLinecap="round"
          fill={focused ? props.color : "none"}
        />
      </Svg>
    );
  },
  "thumbs-down": (props: any, focused: boolean) => {
    return (
      <Svg
        width={props.size || 18}
        height={props.size || 20}
        viewBox="0 0 18 20"
        fill="none"
      >
        <Path
          d="M6.1639 11.125V16.75C6.1639 17.9926 7.13418 19 8.33108 19H9.41467C10.0131 19 10.4983 18.4963 10.4983 17.875V14.8406C10.4983 14.6185 10.5616 14.4014 10.6803 14.2166L12.4833 11.4087C12.6019 11.2239 12.6654 11.0065 12.6654 10.7844V2.125H9.86351C9.57613 2.125 9.30051 2.00647 9.0973 1.7955L8.64846 1.32951C8.44525 1.11853 8.16963 1 7.88224 1H3.76925C2.66497 1 1.73727 1.86206 1.61533 3.00153L1.01333 8.62653C0.870689 9.95935 1.87559 11.125 3.16726 11.125H6.1639ZM6.1639 11.125H8.33108M15.9162 2.125H12.828C12.7382 2.125 12.6654 2.20055 12.6654 2.29375V10.9563C12.6654 11.0494 12.7382 11.125 12.828 11.125H15.9162C16.5147 11.125 16.9998 10.6213 16.9998 10V3.25C16.9998 2.62868 16.5147 2.125 15.9162 2.125Z"
          stroke={props.color}
          strokeWidth="2"
          strokeLinecap="round"
          fill={focused ? props.color : "none"}
        />
      </Svg>
    );
  },
};

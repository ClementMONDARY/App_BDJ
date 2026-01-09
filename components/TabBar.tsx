import type { icon } from "@/constants/icons";
import { TabBarSvg } from "@/constants/svg";
import { useTheme } from "@/contexts/ThemeContext";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { TabBarButton } from "./TabBarButton";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 100, height: 20 });
  const TAB_BAR_PADDING = 20;
  const BUTTON_MARGIN = 12;

  const buttonWidth =
    (dimensions.width - TAB_BAR_PADDING * 2) / state.routes.length;

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height / 1.55,
    });
  };

  const tabPositionX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: tabPositionX.value,
        },
      ],
    };
  });

  return (
    <View onLayout={onTabbarLayout} style={[styles.tabbar]}>
      <Animated.View
        style={[
          {
            position: "absolute",
            backgroundColor: colors.primary,
            borderRadius: 30,
            marginHorizontal: BUTTON_MARGIN,
            marginBottom: 40 + dimensions.height,
            left: 14,
            height: dimensions.height - 18,
            width: buttonWidth - BUTTON_MARGIN - 2,
            borderColor: colors.primaryDark,
            borderWidth: 2,
          },
          animatedStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            marginHorizontal: BUTTON_MARGIN,
            marginBottom: 40 + dimensions.height,
            left: -573.5,
            bottom: -149,
            width: buttonWidth - BUTTON_MARGIN - 2,
            borderColor: colors.primaryDark,
            borderWidth: 2,
          },
          animatedStyle,
        ]}
      >
        <TabBarSvg />
      </Animated.View>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(index * buttonWidth, {
            duration: 500,
          });
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name as keyof typeof icon}
            color={isFocused ? colors.white : colors.iconInactive}
            label={label}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    paddingBottom: 50,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    // Background color is handled dynamically
  },
});

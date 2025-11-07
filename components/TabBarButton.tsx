import { icon } from "@/constants/icons";
import { colors } from "@/styles";
import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function TabBarButton({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
  label,
}: {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
  color: string;
  label: string;
}) {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(
      typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused,
      { duration: 300 },
    );
  }, [scale, isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(scale.value, [0, 1], [1, 1.2]),
        },
      ],
      bottom: interpolate(scale.value, [0, 1], [0, 23]),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scale.value, [0, 1], [1, 0]),
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        gap: 5,
      }}
    >
      <Animated.View style={animatedIconStyle}>
        {icon[routeName](
          {
            color: color,
            size: 24,
          },
          isFocused,
        )}
      </Animated.View>
      <Animated.Text
        style={[
          {
            color: colors.iconInactive,
            textAlign: "center",
          },
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

import { colors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
};

export function AnimatedTabIcon({ name, color, focused }: Props) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(focused ? -20 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [focused, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        focused && {
          backgroundColor: colors.primary,
          borderRadius: 9999,
          padding: 10,
          shadowColor: colors.shadow,
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 5,
        },
      ]}
    >
      <Ionicons name={name} size={24} color={color} />
    </Animated.View>
  );
}

import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/styles/constants";
import { useMemo } from "react";
import { type ImageStyle, type TextStyle, type ViewStyle } from "react-native";

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export function useThemeStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  styleFactory: (colors: ThemeColors) => T,
): T {
  const { colors } = useTheme();

  return useMemo(() => styleFactory(colors), [colors, styleFactory]);
}

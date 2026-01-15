import { useTheme } from "@/contexts/ThemeContext";
import type { baseFontSize, ThemeColors } from "@/styles/constants";
import { useMemo } from "react";
import type { ImageStyle, TextStyle, ViewStyle } from "react-native";

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export function useThemeStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  styleFactory: (colors: ThemeColors, fontSizes: typeof baseFontSize) => T,
): T {
  const { colors, fontSizes } = useTheme();

  return useMemo(
    () => styleFactory(colors, fontSizes),
    [colors, fontSizes, styleFactory],
  );
}

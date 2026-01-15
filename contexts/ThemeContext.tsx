import {
  baseFontSize,
  darkColors,
  lightColors,
  type ThemeColors,
} from "@/styles/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";
export type TextSize = "small" | "medium" | "large";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  fontSizes: typeof baseFontSize;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  colors: lightColors,
  isDark: false,
  textSize: "medium",
  setTextSize: () => {},
  fontSizes: baseFontSize,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [textSize, setTextSizeState] = useState<TextSize>("medium");
  const [isReady, setIsReady] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("app_theme");
        const savedTextSize = await AsyncStorage.getItem("app_text_size");

        if (savedTheme) {
          setThemeState(savedTheme as ThemeMode);
        }
        if (savedTextSize) {
          setTextSizeState(savedTextSize as TextSize);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setIsReady(true);
      }
    };
    loadSettings();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem("app_theme", newTheme);
    } catch (error) {
      console.error("Failed to save theme", error);
    }
  };

  const setTextSize = async (newSize: TextSize) => {
    try {
      setTextSizeState(newSize);
      await AsyncStorage.setItem("app_text_size", newSize);
    } catch (error) {
      console.error("Failed to save text size", error);
    }
  };

  // Determine active colors
  const activeTheme =
    theme === "system" ? (systemScheme === "dark" ? "dark" : "light") : theme;

  const isDark = activeTheme === "dark";
  const colors = isDark ? darkColors : lightColors;

  // Calculate scaled font sizes
  const scale = textSize === "small" ? 0.85 : textSize === "large" ? 1.15 : 1.0;

  const fontSizes = Object.fromEntries(
    Object.entries(baseFontSize).map(([key, value]) => [
      key,
      Math.round(value * scale),
    ]),
  ) as typeof baseFontSize;

  if (!isReady) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colors,
        isDark,
        textSize,
        setTextSize,
        fontSizes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

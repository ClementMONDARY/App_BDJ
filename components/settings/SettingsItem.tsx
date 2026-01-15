import { icon } from "@/constants/icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fontSize, fonts, type ThemeColors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export type SettingsItemType = "bool" | "select" | "link" | "action";
export type IconName = keyof typeof icon;

interface SettingsItemProps {
  type: SettingsItemType;
  icon?: IconName;
  label: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  selectedValue?: string;
  href?: string;
  onPress?: () => void;
  isDestructive?: boolean;
  isWarning?: boolean;
}

export function SettingsItem({
  type,
  icon: iconName,
  label,
  value,
  onValueChange,
  selectedValue,
  href,
  onPress,
  isDestructive,
  isWarning,
}: SettingsItemProps) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const IconComponent = iconName ? (icon[iconName] as any) : null;

  // Determine colors based on state
  let textColor = colors.text;
  let iconColor = colors.text;
  let backgroundColor = "transparent";
  let chevronColor = colors.text;
  const dropdownBorderColor = colors.border;
  const dropdownTextColor = colors.textSecondary;

  if (isDestructive) {
    backgroundColor = colors.error;
    textColor = colors.textWhite;
    iconColor = colors.textWhite;
    chevronColor = colors.textWhite;
  } else if (isWarning) {
    backgroundColor = "#E8A302";
    textColor = colors.textWhite;
    iconColor = colors.textWhite;
    chevronColor = colors.textWhite;
  }

  const renderRightContent = () => {
    switch (type) {
      case "bool":
        return (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textWhite}
          />
        );
      case "select":
        return (
          <View
            style={[styles.dropdownMock, { borderColor: dropdownBorderColor }]}
          >
            <Text style={[styles.dropdownText, { color: dropdownTextColor }]}>
              {selectedValue}
            </Text>
            <Ionicons
              name="caret-down-outline"
              size={12}
              color={colors.iconInactive}
            />
          </View>
        );
      case "link":
      case "action":
        return (
          <Ionicons name="chevron-forward" size={20} color={chevronColor} />
        );
      default:
        return null;
    }
  };

  const Content = (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          {IconComponent && (
            <IconComponent size={25} color={iconColor} focused={true} />
          )}
        </View>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
      {renderRightContent()}
    </View>
  );

  if (type === "link" && href) {
    return (
      <Link href={href as any} asChild>
        <TouchableOpacity onPress={onPress}>{Content}</TouchableOpacity>
      </Link>
    );
  }

  if (type === "action" || type === "select") {
    return <TouchableOpacity onPress={onPress}>{Content}</TouchableOpacity>;
  }

  return <View>{Content}</View>;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 5,
    },
    leftContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    iconContainer: {
      width: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: fontSize.m,
      fontFamily: fonts.primaryBold,
    },
    dropdownMock: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 3,
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 5,
      minWidth: 100,
      justifyContent: "space-between",
    },
    dropdownText: {
      fontSize: 16,
      fontFamily: "Roboto Mono",
    },
  });

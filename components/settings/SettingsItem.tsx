import { icon } from "@/constants/icons";
import { colors, fonts, fontSize } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export type SettingsItemType = "bool" | "select" | "link" | "action";
export type IconName = keyof typeof icon;

interface SettingsItemProps {
  type: SettingsItemType;
  icon: IconName;
  label: string;
  // For 'bool'
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  // For 'select'
  selectedValue?: string;
  // For 'link' / 'action'
  href?: string;
  onPress?: () => void;
  // Appearance
  isDestructive?: boolean; // For red delete button
  isWarning?: boolean; // For orange logout button
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
  const IconComponent = icon[iconName] as any;

  // Determine colors based on state
  let textColor = colors.textDark;
  let iconColor = colors.textDark;
  let backgroundColor = "transparent";
  let chevronColor = colors.textDark;

  if (isDestructive) {
    backgroundColor = colors.error; // #CD0000 or similar
    textColor = colors.white;
    iconColor = colors.white;
    chevronColor = colors.white;
  } else if (isWarning) {
    backgroundColor = "#E8A302";
    textColor = colors.white;
    iconColor = colors.white;
    chevronColor = colors.white;
  }

  const renderRightContent = () => {
    switch (type) {
      case "bool":
        return (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
          />
        );
      case "select":
        return (
          <View style={styles.dropdownMock}>
            <Text style={styles.dropdownText}>{selectedValue}</Text>
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
    // Select might be clickable to open modal in future
    return <TouchableOpacity onPress={onPress}>{Content}</TouchableOpacity>;
  }

  return <View>{Content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12, // Added padding for background color cases
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
    borderColor: colors.inputBorder,
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
    color: colors.iconInactive,
  },
});

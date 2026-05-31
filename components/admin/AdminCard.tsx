import { useThemeStyles } from "@/hooks/useThemeStyles";
import { borderRadius, fonts, type fontSize, type ThemeColors } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

interface AdminCardProps {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AdminCard({ iconName, label, onPress, style }: AdminCardProps) {
  const styles = useThemeStyles(createStyles);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        style,
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <Ionicons name={iconName} size={50} color="white" />
        <Ionicons name="chevron-forward" size={25} color="white" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors, fontSizes: typeof fontSize) =>
  StyleSheet.create({
    card: {
      padding: 10,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.s,
      borderWidth: 2,
      borderColor: colors.primaryDark,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
      gap: 5,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    label: {
      color: "white",
      fontSize: fontSizes.l + 2,
      fontFamily: fonts.primaryBold,
    },
  });

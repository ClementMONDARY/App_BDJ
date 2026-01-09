import { useThemeStyles } from "@/hooks/useThemeStyles";
import { fontSize, fonts, spacing, type ThemeColors } from "@/styles";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface UnderlinedTitleProps {
  title: string;
  style?: StyleProp<ViewStyle>;
}

export function UnderlinedTitle({ title, style }: UnderlinedTitleProps) {
  const styles = useThemeStyles(createStyles);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.underline} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: "100%",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      gap: 5,
    },
    title: {
      color: colors.text,
      fontSize: fontSize.l + 2,
      fontFamily: fonts.primaryBold,
      paddingLeft: spacing.sm,
    },
    underline: {
      alignSelf: "stretch",
      height: 2,
      backgroundColor: colors.border, // Using border color for underline in dark mode usually looks better or specific underline color
      borderRadius: 5,
    },
  });

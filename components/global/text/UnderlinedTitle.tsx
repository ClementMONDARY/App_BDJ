import { colors, fontSize, fonts, spacing } from "@/styles";
import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

interface UnderlinedTitleProps {
  title: string;
  style?: StyleProp<ViewStyle>;
}

export function UnderlinedTitle({ title, style }: UnderlinedTitleProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 5,
  },
  title: {
    color: colors.black,
    fontSize: fontSize.l + 2,
    fontFamily: fonts.primaryBold,
    paddingLeft: spacing.sm,
  },
  underline: {
    alignSelf: "stretch",
    height: 2,
    backgroundColor: colors.underline,
    borderRadius: 5,
  },
});

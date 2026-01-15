import { useThemeStyles } from "@/hooks/useThemeStyles";
import type { ThemeColors } from "@/styles";
import { StyleSheet, Text, View } from "react-native";

export default function Forum() {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Forum</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    text: {
      color: colors.text,
      fontSize: 24,
    },
  });

import { useThemeStyles } from "@/hooks/useThemeStyles";
import type { ThemeColors } from "@/styles";
import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFound() {
  const styles = useThemeStyles(createStyles);

  return (
    <>
      <Stack.Screen options={{ title: "Page non trouvée" }} />
      <View style={styles.container}>
        <Link href="/" style={styles.link}>
          Retour à l'accueil
        </Link>
      </View>
    </>
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
    link: {
      fontSize: 18,
      color: colors.primary,
    },
  });

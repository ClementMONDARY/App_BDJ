import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFound() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    fontSize: 18,
    color: "blue",
  },
});